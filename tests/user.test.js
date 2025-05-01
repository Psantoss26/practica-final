// tests/user.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

let mongod;
let token;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // Registro y validación de email
  const registerRes = await request(app)
    .post('/api/user/register')
    .send({ email: 'test@example.com', password: 'password123' });
  expect(registerRes.status).toBe(201);
  token = registerRes.body.token;
  const validationCode = registerRes.body.user.code;

  const validateRes = await request(app)
    .post('/api/user/validate')
    .set('Authorization', `Bearer ${token}`)
    .send({ code: validationCode });
  expect(validateRes.status).toBe(200);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('🔐 User API', () => {
  it('POST /api/user/login → login exitoso', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('GET /api/user → devuelve datos', async () => {
    const res = await request(app)
      .get('/api/user')                   // ruta GET /api/user :contentReference[oaicite:1]{index=1}
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('PUT /api/user/register → actualiza datos personales', async () => {
    const res = await request(app)
      .put('/api/user/register')          // ruta PUT /api/user/register :contentReference[oaicite:2]{index=2}
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Juan', apellidos: 'Pérez', nif: '12345678Z' });
    expect(res.status).toBe(200);
    expect(res.body.user.nif).toBe('12345678Z');
  });

  it('PATCH /api/user/company → actualiza datos compañía', async () => {
    const res = await request(app)
      .patch('/api/user/company')         // ruta PATCH /api/user/company :contentReference[oaicite:3]{index=3}
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Empresa S.L.',
        cif: 'A12345678',
        direccion: 'Calle Falsa 1',
        autonomo: false
      });
    expect(res.status).toBe(200);
    expect(res.body.empresa.nombre).toBe('Empresa S.L.');
  });
});
