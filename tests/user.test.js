// tests/user.test.js
require('dotenv').config();
jest.mock('../utils/emailService', () => ({
  sendVerificationEmail:    jest.fn().mockResolvedValue(),
  sendPasswordResetEmail:   jest.fn().mockResolvedValue()
}));

const request = require('supertest');
const mongoose = require('mongoose');
const app      = require('../app');
const User     = require('../models/user.model');

describe('🔐 User Endpoints (REAL MongoDB TEST DB)', () => {
  let token;

  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_MONGO_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    // No borramos la colección para que queden persistidos
    await mongoose.disconnect();
  });

  it('1. POST /api/user/register → Registro de usuario', async () => {
    const payload = { email: 'testuser@example.com', password: 'password123' };
    const res     = await request(app).post('/api/user/register').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('2. POST /api/user/validate → Validación de email', async () => {
    const u    = await User.findOne({ email: 'testuser@example.com' });
    const code = u.emailCode;
    const res  = await request(app)
      .post('/api/user/validate')
      .set('Authorization', `Bearer ${token}`)
      .send({ code });
    expect(res.status).toBe(200);
  });

  it('3. POST /api/user/login → Login', async () => {
    const payload = { email: 'testuser@example.com', password: 'password123' };
    const res     = await request(app).post('/api/user/login').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('4. PUT /api/user/register → Completar datos personales', async () => {
    const personal = { nombre: 'Nicolás', apellidos: 'Padre', nif: '12345678A' };
    const res      = await request(app)
      .put('/api/user/register')
      .set('Authorization', `Bearer ${token}`)
      .send(personal);
    expect(res.status).toBe(200);
    expect(res.body.user.nif).toBe(personal.nif);
  });

  it('7. POST /api/user/forgot-password → Solicitar código', async () => {
    const res = await request(app)
      .post('/api/user/forgot-password')
      .send({ email: 'testuser@example.com' });
    expect(res.status).toBe(200);
  });

  it('8. PATCH /api/user/reset-password → Recuperar contraseña', async () => {
    const u = await User.findOne({ email: 'testuser@example.com' });
    const payload = {
      email:       u.email,
      code:        u.resetCode,
      newPassword: 'nuevaClave123'
    };
    const res = await request(app)
      .patch('/api/user/reset-password')
      .send(payload);
    expect(res.status).toBe(200);
  });

  it('9. PATCH /api/user/change-password → Cambiar contraseña', async () => {
    const payload = { oldPassword: 'nuevaClave123', newPassword: '9876' };
    const res     = await request(app)
      .patch('/api/user/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(res.status).toBe(200);
  });

  it('10. GET /api/user → Obtener información del usuario', async () => {
    const res = await request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('11. DELETE /api/user → Soft delete', async () => {
    const res = await request(app)
      .delete('/api/user')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('12. DELETE /api/user?soft=false → Hard delete', async () => {
    const res = await request(app)
      .delete('/api/user?soft=false')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
