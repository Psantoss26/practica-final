const express = require('express');
const router = express.Router();
const deliveryNoteController = require('../controllers/deliveryNote.controller');
const auth = require('../middleware/auth.middleware');
const uploadSignature = require('../middleware/uploadSignature.middleware');

/**
 * @swagger
 * tags:
 *   name: Albarán
 *   description: Endpoints para la gestión de albaranes (horas y materiales)
 */

/**
 * @swagger
 * /api/deliverynote:
 *   post:
 *     summary: Crear un nuevo albarán
 *     tags: [Albarán]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipo, clientId, projectId, items]
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [horas, materiales]
 *               clientId:
 *                 type: string
 *               projectId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [tipo, descripcion, cantidad]
 *                   properties:
 *                     tipo:
 *                       type: string
 *                       enum: [hora, material]
 *                     descripcion:
 *                       type: string
 *                     cantidad:
 *                       type: number
 *                     horas:
 *                       type: number
 *                     precio:
 *                       type: number
 *     responses:
 *       201:
 *         description: Albarán creado correctamente
 */
router.post('/', auth, deliveryNoteController.createDeliveryNote);

/**
 * @swagger
 * /api/deliverynote:
 *   get:
 *     summary: Obtener todos los albaranes del usuario o su empresa
 *     tags: [Albarán]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de albaranes
 */
router.get('/', auth, deliveryNoteController.getAllNotes);

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   get:
 *     summary: Obtener un albarán por ID
 *     tags: [Albarán]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán encontrado
 *       404:
 *         description: Albarán no encontrado
 */
router.get('/:id', auth, deliveryNoteController.getNoteById);

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   delete:
 *     summary: Eliminar un albarán (solo si no está firmado)
 *     tags: [Albarán]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán eliminado
 *       400:
 *         description: No se puede eliminar un albarán firmado
 */
router.delete('/:id', auth, deliveryNoteController.deleteNote);

/**
 * @swagger
 * /api/deliverynote/sign/{id}:
 *   patch:
 *     summary: Firmar un albarán subiendo una imagen de firma
 *     tags: [Albarán]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firma:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Firma guardada correctamente
 */
router.patch('/sign/:id', auth, uploadSignature.single('firma'), deliveryNoteController.signNote);

/**
 * @swagger
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     summary: Generar y descargar el PDF de un albarán
 *     tags: [Albarán]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/pdf/:id', auth, deliveryNoteController.generatePdf);

module.exports = router;
