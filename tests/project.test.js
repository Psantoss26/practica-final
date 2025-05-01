// tests/project.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

let mongod;
let token;
let clientId;
let projectId;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // Usuario + validación
  const reg = await request(app)
    .post('/api/user/register')
    .send({ email: 'prj@test.com', password: 'password123' });
  token = reg.body.token;
  await request(app)
    .post('/api/user/validate')
    .set('Authorization', `Bearer ${token}`)
    .send({ code: reg.body.user.code });

  // Crear cliente
  const cli = await request(app)
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ nombre: 'ClientX', email: 'x@c.com', telefono: '000', direccion: 'Dir' });
  clientId = cli.body.client._id;
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

describe('📁 Project API', () => {
  it('CRUD completo de /api/project', async () => {
    // CREATE
    let res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Proj1', descripcion: 'Desc', clientId });
    expect(res.status).toBe(201);
    projectId = res.body.project._id;

    // READ ALL
    res = await request(app)
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.projects).toHaveLength(1);

    // READ ONE
    res = await request(app)
      .get(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    // UPDATE
    res = await request(app)
      .put(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Proj1 Updated' });
    expect(res.status).toBe(200);

    // ARCHIVE
    res = await request(app)
      .patch(`/api/project/${projectId}/archive`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    // LIST ARCHIVED
    res = await request(app)
      .get('/api/project/archived/list')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    // RECOVER
    res = await request(app)
      .patch(`/api/project/${projectId}/recover`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    // DELETE
    res = await request(app)
      .delete(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
