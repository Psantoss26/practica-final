// tests/client.test.js
require('dotenv').config();
// forzamos a la app a usar la URI de test:
process.env.MONGO_URI     = process.env.TEST_MONGO_URI;
process.env.MONGODB_URI   = process.env.TEST_MONGO_URI;

const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../app');
const User     = require('../models/user.model');

describe('👥 Client Endpoints (REAL MongoDB TEST DB)', () => {
    let token, clientId;
  
    beforeAll(async () => {
      await mongoose.connect(process.env.TEST_MONGO_URI);
      // (Opcional) limpiar clientes antiguos antes de arrancar:
      // await mongoose.connection.db.dropCollection('clients').catch(() => {});
      // Crear y validar usuario
      const reg = await request(app)
        .post('/api/user/register')
        .send({ email: 'cli@test.com', password: 'password123' });
      const code = reg.body.user.code;
      token = reg.body.token;
      await request(app)
        .put('/api/user/validate')
        .set('Authorization', `Bearer ${token}`)
        .send({ code });
    });
  
    afterAll(async () => {
      // No borramos la colección para que queden persistidos
      await mongoose.disconnect();
    });

  it('1. POST /api/client → Crear cliente', async () => {
    const payload = { nombre: 'Cliente Ejemplo', email: 'c@e.com', telefono: '1234', direccion: 'Dir 1' };
    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(res.status).toBe(201);
    clientId = res.body.client._id;
  });

  it('2. PATCH /api/client/:id → Actualizar cliente', async () => {
    const payload = { nombre: 'Cliente Modificado', email: 'nuevo@c.com' };
    const res = await request(app)
      .patch(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(res.status).toBe(200);
  });

  it('3. GET /api/client → Obtener todos los clientes', async () => {
    const res = await request(app)
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.clients.length).toBeGreaterThanOrEqual(1);
  });

  it('4. GET /api/client/:id → Obtener cliente por ID', async () => {
    const res = await request(app)
      .get(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('5. PATCH /api/client/:id/archive → Archivar cliente', async () => {
    const res = await request(app)
      .patch(`/api/client/${clientId}/archive`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('6. GET /api/client/archived/list → Listar archivados', async () => {
    const res = await request(app)
      .get('/api/client/archived/list')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('7. PATCH /api/client/:id/recover → Recuperar cliente archivado', async () => {
    const res = await request(app)
      .patch(`/api/client/${clientId}/recover`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('8. DELETE /api/client/:id → Eliminar cliente (hard delete)', async () => {
    const res = await request(app)
      .delete(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
