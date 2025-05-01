// tests/client.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

let mongod;
let token;
let clientId;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // Crear y validar usuario
  const reg = await request(app)
    .post('/api/user/register')
    .send({ email: 'cli@test.com', password: 'password123' });
  token = reg.body.token;
  await request(app)
    .post('/api/user/validate')
    .set('Authorization', `Bearer ${token}`)
    .send({ code: reg.body.user.code });
});

afterEach(async () => {
  for (const col of Object.values(mongoose.connection.collections)) {
    await col.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('👥 Client API', () => {
  it('CRUD completo de /api/client', async () => {
    // CREATE
    let res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'ACME', email: 'acme@acme.com', telefono: '1234', direccion: 'C/Falsa 1' });
    expect(res.status).toBe(201);
    clientId = res.body.client._id;

    // READ ALL
    res = await request(app)
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.clients).toHaveLength(1);

    // UPDATE
    res = await request(app)
      .patch(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'ACME Updated' });
    expect(res.status).toBe(200);
    expect(res.body.client.nombre).toBe('ACME Updated');

    // ARCHIVE
    res = await request(app)
      .patch(`/api/client/${clientId}/archive`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    // LIST ARCHIVED
    res = await request(app)
      .get('/api/client/archived/list')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.clients[0].deleted).toBe(true);

    // RECOVER
    res = await request(app)
      .patch(`/api/client/${clientId}/recover`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    // DELETE
    res = await request(app)
      .delete(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
