const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const auth = require('../middleware/auth.middleware');

// Crear cliente
router.post('/', auth, clientController.createClient);

// Actualizar cliente
router.patch('/:id', auth, clientController.updateClient);

// Obtener todos los clientes del usuario o su empresa
router.get('/', auth, clientController.getClients);

// Obtener un cliente por ID
router.get('/:id', auth, clientController.getClientById);

// Archivar (soft delete)
router.patch('/:id/archive', auth, clientController.archiveClient);

// Eliminar (hard delete)
router.delete('/:id', auth, clientController.deleteClient);

// Obtener archivados
router.get('/archived/list', auth, clientController.getArchivedClients);

// Recuperar cliente
router.patch('/:id/recover', auth, clientController.recoverClient);

module.exports = router;
