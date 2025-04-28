const supertest = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../app');
const User = require('../models/user.model');
const Client = require('../models/client.model');
const Project = require('../models/project.model');
const DeliveryNote = require('../models/deliveryNote.model');

const request = supertest(app);

let token = '';
let clientId = '';
let projectId = '';
let deliveryNoteId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || process.env.MONGO_URI);

  // Limpiar todas las colecciones
  await Promise.all([
    User.deleteMany({}),
    Client.deleteMany({}),
    Project.deleteMany({}),
    DeliveryNote.deleteMany({})
  ]);

  // Registrar usuario
  await request.post('/api/user/register')
    .send({ email: 'testuser@mail.com', password: '12345678' })
    .expect(201);

  // Validarlo manualmente
  const user = await User.findOne({ email: 'testuser@mail.com' });
  user.isValidated = true;
  await user.save();

  // Login
  const loginRes = await request.post('/api/user/login')
    .send({ email: 'testuser@mail.com', password: '12345678' })
    .expect(200);

  token = loginRes.body.token;

  // Crear cliente de prueba
  const clientRes = await request.post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({
      nombre: 'Cliente Test',
      email: 'clientetest@mail.com',
      telefono: '123456789',
      direccion: 'Calle Test 123'
    })
    .expect(201);

  clientId = clientRes.body.client._id;

  // Crear proyecto
  const projectRes = await request.post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({
      nombre: 'Proyecto Test',
      descripcion: 'Proyecto para testing',
      clientId
    })
    .expect(201);

  projectId = projectRes.body.project._id;
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
  console.log('✅ Test finalizado correctamente');
});

jest.setTimeout(30000);

// ---------------- TESTS ------------------------

describe('Endpoints de Usuarios', () => {
  it('debería registrar un nuevo usuario', async () => {
    const res = await request
      .post('/api/user/register')
      .send({ email: `test${Date.now()}@mail.com`, password: '12345678' })
      .expect(201);

    expect(res.body.user).toHaveProperty('email');
  });

  it('debería obtener los datos del usuario autenticado', async () => {
    const res = await request
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.user).toBeDefined();
  });
});

describe('Endpoints de Clientes', () => {
  it('debería listar los clientes', async () => {
    const res = await request.get('/api/client')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});

describe('Endpoints de Proyectos', () => {
  it('debería listar los proyectos', async () => {
    const res = await request.get('/api/project')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});

describe('Endpoints de Albaranes', () => {
  it('debería crear un nuevo albarán', async () => {
    const res = await request.post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tipo: 'horas',
        clientId: clientId,
        projectId: projectId,
        items: [
          {
            tipo: 'hora',
            descripcion: 'Trabajo técnico de prueba',
            cantidad: 3,
            horas: 3,
            precio: 50
          }
        ]
      });
    expect(res.statusCode).toBe(201);
    deliveryNoteId = res.body.note._id;
  });

  it('debería listar los albaranes', async () => {
    const res = await request.get('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('debería obtener un albarán por su ID', async () => {
    const res = await request.get(`/api/deliverynote/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.note).toBeDefined();
  });
});
