// tests/deliveryNote.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

let mongod;
let token;
let clientId;
let projectId;
let noteId;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';

  // Arrancamos MongoDB en memoria
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // 1) Registrar usuario
  const reg = await request(app)
    .post('/api/user/register')
    .send({ email: 'note@test.com', password: 'password123' });
  expect(reg.status).toBe(201);
  token = reg.body.token;

  // 2) Validar email
  const validate = await request(app)
    .post('/api/user/validate')
    .set('Authorization', `Bearer ${token}`)
    .send({ code: reg.body.user.code });
  expect(validate.status).toBe(200);

  // 3) Crear cliente
  const cli = await request(app)
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({
      nombre: 'CliNote',
      email: 'x@cl.com',
      telefono: '000',
      direccion: 'Dir'
    });
  expect(cli.status).toBe(201);
  clientId = cli.body.client._id;

  // 4) Crear proyecto
  const prj = await request(app)
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({
      nombre: 'ProjNote',
      descripcion: '',
      clientId
    });
  expect(prj.status).toBe(201);
  projectId = prj.body.project._id;
});

afterEach(async () => {
  // Limpiar BD tras cada it()
  for (const col of Object.values(mongoose.connection.collections)) {
    await col.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('📄 DeliveryNote API', () => {
  it('CRUD completo y firma de /api/deliverynote', async () => {
    // --- CREATE ---
    let res = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tipo: 'horas',
        clientId,
        projectId,
        items: [{
          tipo: 'hora',
          descripcion: 'Dev',
          cantidad: 1,
          horas: 2,
          precio: 50
        }]
      });
    expect(res.status).toBe(201);
    noteId = res.body.note._id;

    // --- READ ALL ---
    res = await request(app)
      .get('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.notes).toHaveLength(1);

    // --- READ ONE ---
    res = await request(app)
      .get(`/api/deliverynote/${noteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.note._id).toBe(noteId);

    // --- DELETE NO FIRMADO ---
    res = await request(app)
      .delete(`/api/deliverynote/${noteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    // --- CREATE OTRO PARA FIRMAR ---
    const createRes = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tipo: 'materiales',
        clientId,
        projectId,
        items: [{
          tipo: 'material',
          descripcion: 'Laptop',
          cantidad: 1,
          precio: 1000
        }]
      });
    expect(createRes.status).toBe(201);
    noteId = createRes.body.note._id;

    // --- PATCH SIGN CON BUFFER (no depende de fixtures) ---
    res = await request(app)
      .patch(`/api/deliverynote/sign/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      // adjuntamos un Buffer simulando una imagen PNG
      .attach('firma', Buffer.from([0x89,0x50,0x4E,0x47]), 'sign.png');
    expect(res.status).toBe(200);
    expect(res.body.firma).toMatch(/^\/firmas\//);
  });
});
