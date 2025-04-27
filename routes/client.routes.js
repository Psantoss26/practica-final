const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const auth = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Cliente
 *   description: Endpoints relacionados con la gestión de clientes
 */

/**
 * @swagger
 * /api/client:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Cliente]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, telefono, direccion]
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente creado correctamente
 */
router.post('/', auth, clientController.createClient);

/**
 * @swagger
 * /api/client/{id}:
 *   patch:
 *     summary: Actualizar datos de un cliente
 *     tags: [Cliente]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente actualizado
 */
router.patch('/:id', auth, clientController.updateClient);

/**
 * @swagger
 * /api/client:
 *   get:
 *     summary: Obtener todos los clientes del usuario o de su empresa
 *     tags: [Cliente]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.get('/', auth, clientController.getClients);

/**
 * @swagger
 * /api/client/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Cliente]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/:id', auth, clientController.getClientById);

/**
 * @swagger
 * /api/client/{id}/archive:
 *   patch:
 *     summary: Archivar un cliente (soft delete)
 *     tags: [Cliente]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente archivado
 */
router.patch('/:id/archive', auth, clientController.archiveClient);

/**
 * @swagger
 * /api/client/{id}:
 *   delete:
 *     summary: Eliminar cliente definitivamente (hard delete)
 *     tags: [Cliente]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente eliminado
 */
router.delete('/:id', auth, clientController.deleteClient);

/**
 * @swagger
 * /api/client/archived/list:
 *   get:
 *     summary: Obtener lista de clientes archivados
 *     tags: [Cliente]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes archivados
 */
router.get('/archived/list', auth, clientController.getArchivedClients);

/**
 * @swagger
 * /api/client/{id}/recover:
 *   patch:
 *     summary: Recuperar un cliente archivado
 *     tags: [Cliente]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente recuperado
 */
router.patch('/:id/recover', auth, clientController.recoverClient);

module.exports = router;
