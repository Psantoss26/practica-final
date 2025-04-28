const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const userRoutes = require('./routes/user.routes');
const clientRoutes = require('./routes/client.routes');
const projectRoutes = require('./routes/project.routes');
const deliveryNoteRoutes = require('./routes/deliveryNote.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

// Swagger setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'PW2S API',
    version: '1.0.0',
    description: 'Documentación de API de usuarios, clientes, proyectos y albaranes'
  },
  servers: [
    { url: 'http://localhost:3000' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [{ bearerAuth: [] }]
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(errorMiddleware);

// Rutas
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/user', userRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/deliverynote', deliveryNoteRoutes);

// Archivos estáticos
app.use('/firmas', express.static(path.join(__dirname, 'firmas')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

module.exports = app;
