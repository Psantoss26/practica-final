// tests/project.test.js
require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

describe('📁 Project Endpoints (REAL MongoDB TEST DB)', () => {
    let token, clientId, projectId;
  
    beforeAll(async () => {
      await mongoose.connect(process.env.TEST_MONGO_URI);
      // (Opcional) limpiar proyectos antiguos antes de arrancar:
      // await mongoose.connection.db.dropCollection('projects').catch(() => {});
      // Crear y validar usuario
      const reg = await request(app)
        .post('/api/user/register')
        .send({ email: 'prj@test.com', password: 'password123' });
      const code = reg.body.user.code;
      token = reg.body.token;
      await request(app)
        .put('/api/user/validate')
        .set('Authorization', `Bearer ${token}`)
        .send({ code });
  
      // Crear cliente para el proyecto
      const cli = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'ClientX', email: 'x@c.com', telefono: '000', direccion: 'Dir' });
      clientId = cli.body.client._id;
    });
  
    afterAll(async () => {
      // No borramos la colección para que queden persistidos
      await mongoose.disconnect();
    });

  it('1. POST /api/project → Crear proyecto', async () => {
    const payload = { nombre: 'Proyecto Demo', descripcion: 'Desc', clientId };
    console.log('[PROJECT] POST /api/project payload:', payload);
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    console.log('[PROJECT] Response:', res.status, res.body);
    expect(res.status).toBe(201);
    projectId = res.body.project._id;
  });

  it('2. PUT /api/project/:id → Actualizar proyecto', async () => {
    const payload = { nombre: 'Proyecto Demo Updated', descripcion: 'Backend completo' };
    console.log('[PROJECT] PUT /api/project/:id payload:', payload);
    const res = await request(app)
      .put(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    console.log('[PROJECT] Response:', res.status, res.body);
    expect(res.status).toBe(200);
  });

  it('3. GET /api/project → Listar proyectos activos', async () => {
    console.log('[PROJECT] GET /api/project');
    const res = await request(app)
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`);
    console.log('[PROJECT] Response:', res.status, res.body);
    expect(res.status).toBe(200);
  });

  it('4. GET /api/project/:id → Obtener proyecto', async () => {
    console.log('[PROJECT] GET /api/project/:id', projectId);
    const res = await request(app)
      .get(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    console.log('[PROJECT] Response:', res.status, res.body);
    expect(res.status).toBe(200);
  });

  it('5. PATCH /api/project/:id/archive → Archivar proyecto', async () => {
    console.log('[PROJECT] PATCH /api/project/:id/archive');
    const res = await request(app)
      .patch(`/api/project/${projectId}/archive`)
      .set('Authorization', `Bearer ${token}`);
    console.log('[PROJECT] Response:', res.status, res.body);
    expect(res.status).toBe(200);
  });

  it('6. GET /api/project/archived/list → Listar archivados', async () => {
    console.log('[PROJECT] GET /api/project/archived/list');
    const res = await request(app)
      .get('/api/project/archived/list')
      .set('Authorization', `Bearer ${token}`);
    console.log('[PROJECT] Response:', res.status, res.body);
    expect(res.status).toBe(200);
  });

  it('7. PATCH /api/project/:id/recover → Recuperar proyecto archivado', async () => {
    console.log('[PROJECT] PATCH /api/project/:id/recover');
    const res = await request(app)
      .patch(`/api/project/${projectId}/recover`)
      .set('Authorization', `Bearer ${token}`);
    console.log('[PROJECT] Response:', res.status, res.body);
    expect(res.status).toBe(200);
  });

  it('8. DELETE /api/project/:id → Hard delete proyecto', async () => {
    console.log('[PROJECT] DELETE /api/project/:id');
    const res = await request(app)
      .delete(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    console.log('[PROJECT] Response:', res.status, res.body);
    expect(res.status).toBe(200);
  });
});
