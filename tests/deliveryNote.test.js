// tests/deliveryNote.test.js
require('dotenv').config();
process.env.MONGO_URI   = process.env.TEST_MONGO_URI;
process.env.MONGODB_URI = process.env.TEST_MONGO_URI;

const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../app');
const User     = require('../models/user.model');

describe('📄 DeliveryNote Endpoints (REAL MongoDB TEST DB)', () => {
    let token, clientId, projectId, noteId;
  
    beforeAll(async () => {
      await mongoose.connect(process.env.TEST_MONGO_URI);
      // (Opcional) limpiar albaranes antiguos antes de arrancar:
      // await mongoose.connection.db.dropCollection('deliverynotes').catch(() => {});
  
      // 1) Registrar y validar usuario
      const reg = await request(app)
        .post('/api/user/register')
        .send({ email: 'note@test.com', password: 'password123' });
      const code = reg.body.user.code;
      token = reg.body.token;
      await request(app)
        .put('/api/user/validate')
        .set('Authorization', `Bearer ${token}`)
        .send({ code });
  
      // 2) Crear cliente
      const cli = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'CliNote', email: 'x@cl.com', telefono: '000', direccion: 'Dir' });
      clientId = cli.body.client._id;
  
      // 3) Crear proyecto
      const prj = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'ProjNote', descripcion: '', clientId });
      projectId = prj.body.project._id;
    });
  
    afterAll(async () => {
      // No borramos la colección para que queden persistidos
      await mongoose.disconnect();
    });

  it('1. POST /api/deliverynote → Crear albarán', async () => {
    const payload = {
      tipo:      'horas',
      clientId,
      projectId,
      items:     [{ tipo: 'hora', descripcion: 'Dev', cantidad: 1, horas: 2, precio: 50 }]
    };
    const res = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(res.status).toBe(201);
    noteId = res.body.note._id;
  });

  it('2. GET /api/deliverynote → Listar albaranes', async () => {
    const res = await request(app)
      .get('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('3. GET /api/deliverynote/:id → Obtener albarán', async () => {
    const res = await request(app)
      .get(`/api/deliverynote/${noteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('4. DELETE /api/deliverynote/:id → Eliminar no firmado', async () => {
    const res = await request(app)
      .delete(`/api/deliverynote/${noteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('5. PATCH /api/deliverynote/sign/:id → Firmar albarán', async () => {
    // Creamos otro albarán
    const createRes = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tipo:      'materiales',
        clientId,
        projectId,
        items:     [{ tipo: 'material', descripcion: 'Laptop', cantidad: 1, precio: 1000 }]
      });
    noteId = createRes.body.note._id;

    const res = await request(app)
      .patch(`/api/deliverynote/sign/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('firma', Buffer.from([0x89,0x50,0x4E,0x47]), 'firma.png');
    expect(res.status).toBe(200);
  });

  it('6. GET /api/deliverynote/pdf/:id → Descargar PDF', async () => {
    const res = await request(app)
      .get(`/api/deliverynote/pdf/${noteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toMatch(/application\/pdf/);
  });
});
