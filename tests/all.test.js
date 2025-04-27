const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
require('dotenv').config()

let token = ''
let clientId = ''
let projectId = ''
let deliveryNoteId = ''

beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri)
      console.log('✅ Conectado a MongoDB para tests')
    }
  
    const User = require('../models/user.model')
  
    // 🔥 Borrar usuario previo si existe
    await User.deleteOne({ email: 'testuser@mail.com' })
  
    // 🔥 Crear usuario
    await request(app)
      .post('/api/user/register')
      .send({
        email: 'testuser@mail.com',
        password: '12345678'
      })
  
    // 🔥 Validarlo manualmente
    const user = await User.findOne({ email: 'testuser@mail.com' })
    if (user) {
      user.isValidated = true
      await user.save()
      console.log('✅ Usuario validado correctamente')
      await new Promise(resolve => setTimeout(resolve, 500)) // esperar que Mongo guarde
    }
  
    // 🔥 Hacer login
    const res = await request(app)
      .post('/api/user/login')
      .send({
        email: 'testuser@mail.com',
        password: '12345678'
      })
  
    if (res.body.token) {
      token = res.body.token
      console.log('✅ Token obtenido para testing')
    } else {
      throw new Error('No se pudo obtener token para los tests')
    }
  
    // 🔥 Crear cliente de prueba
    const clientRes = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Cliente DeliveryTest',
        email: `clientetest${Date.now()}@mail.com`,
        telefono: '123456789',
        direccion: 'Calle Testing 99'
      })
  
    clientId = clientRes.body.client._id
  
    // 🔥 Crear proyecto de prueba
    const projectRes = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Proyecto DeliveryTest',
        descripcion: 'Proyecto para testing albarán',
        clientId: clientId
      })
  
    projectId = projectRes.body.project._id
  })
        

afterAll(async () => {
  await mongoose.connection.close()
  console.log('✅ Desconectado de MongoDB después de tests')
})

jest.setTimeout(30000) // aumentar timeout

// ---------------------------------------------------------

describe('Endpoints de Usuarios', () => {
  it('debería registrar un nuevo usuario', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({
        email: `test${Date.now()}@mail.com`,
        password: '12345678'
      })
    expect(res.statusCode).toBe(201)
    expect(res.body.user).toHaveProperty('email')
  })

  it('debería obtener los datos del usuario autenticado', async () => {
    const res = await request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.user).toBeDefined()
  })
})

// ---------------------------------------------------------

describe('Endpoints de Clientes', () => {
  it('debería listar los clientes', async () => {
    const res = await request(app)
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
  })
})

// ---------------------------------------------------------

describe('Endpoints de Proyectos', () => {
  it('debería listar los proyectos', async () => {
    const res = await request(app)
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
  })
})

// ---------------------------------------------------------

describe('Endpoints de Albaranes', () => {
  it('debería crear un nuevo albarán', async () => {
    const res = await request(app)
      .post('/api/deliverynote')
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
      })
    expect(res.statusCode).toBe(201)
    deliveryNoteId = res.body.note._id
  })

  it('debería listar los albaranes', async () => {
    const res = await request(app)
      .get('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
  })

  it('debería obtener un albarán por su ID', async () => {
    const res = await request(app)
      .get(`/api/deliverynote/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.note).toBeDefined()
  })
})
