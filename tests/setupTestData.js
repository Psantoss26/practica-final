const mongoose = require('mongoose')
const User = require('../models/user.model') // Ajusta el path si es necesario
const Client = require('../models/client.model')
const Project = require('../models/project.model')
const DeliveryNote = require('../models/deliveryNote.model')
const { hash } = require('../utils/hashPassword') // Asumimos que ya tienes función hash

const request = require('supertest')
const app = require('../app') // ruta correcta a tu app de Express
require('dotenv').config()

const mongoUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI

const setupTestData = async () => {
  try {
    await mongoose.connect(mongoUri)
    console.log('✅ Conectado a la base de datos para setup.')

    // Limpiar la base de datos
    await Promise.all([
      User.deleteMany({}),
      Client.deleteMany({}),
      Project.deleteMany({}),
      DeliveryNote.deleteMany({})
    ])
    console.log('🧹 Base de datos limpiada.')

    // Crear usuario de prueba
    const hashedPassword = await hash('12345678')
    const user = await User.create({
      email: 'testuser@mail.com',
      password: hashedPassword,
      isValidated: true,
      role: 'user'
    })
    console.log('👤 Usuario de prueba creado:', user.email)

    // Crear cliente de prueba
    const client = await Client.create({
      nombre: 'Cliente Test',
      email: 'cliente@mail.com',
      telefono: '123456789',
      direccion: 'Calle Falsa 123',
      userId: user._id
    })
    console.log('🏢 Cliente de prueba creado:', client.nombre)

    // Crear proyecto de prueba
    const project = await Project.create({
      nombre: 'Proyecto Test',
      descripcion: 'Descripción de prueba',
      userId: user._id,
      clientId: client._id
    })
    console.log('📂 Proyecto de prueba creado:', project.nombre)

    // Crear delivery note de prueba
    await DeliveryNote.create({
      tipo: 'horas',
      userId: user._id,
      clientId: client._id,
      projectId: project._id,
      items: [
        {
          tipo: 'hora',
          descripcion: 'Trabajo técnico',
          cantidad: 2,
          horas: 2,
          precio: 25
        }
      ]
    })
    console.log('📄 Delivery note de prueba creada.')

    console.log('✅ Setup de datos completado correctamente.')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error en setup de datos:', error)
    process.exit(1)
  }
}

setupTestData()
