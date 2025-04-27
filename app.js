// app.js
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const clientRoutes = require("./routes/client.routes");
const projectRoutes = require('./routes/project.routes');
const deliveryNoteRoutes = require('./routes/deliveryNote.routes');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'PW2S API',
      version: '1.0.0',
      description: 'Documentación de la API de usuarios, clientes, proyectos y albaranes'
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
    apis: ['./routes/*.js'], // Aquí busca los comentarios con Swagger
};
  
const swaggerSpec = swaggerJsdoc(options);

app.use(cors());
app.use(express.json());

app.use(errorMiddleware)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/user', userRoutes);
app.use("/api/client", clientRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/deliverynote', deliveryNoteRoutes);

app.use('/firmas', express.static(path.join(__dirname, 'firmas')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

module.exports = app;
