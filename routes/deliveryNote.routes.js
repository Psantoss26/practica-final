const express = require('express');
const router = express.Router();
const deliveryNoteController = require('../controllers/deliveryNote.controller');
const auth = require('../middleware/auth.middleware');
const uploadSignature = require('../middleware/uploadSignature.middleware');

// Crear albarán (horas o materiales)
router.post('/', auth, deliveryNoteController.createDeliveryNote);

// Obtener todos los albaranes del usuario o su empresa
router.get('/', auth, deliveryNoteController.getAllNotes);

// Obtener un albarán por ID (con datos relacionados)
router.get('/:id', auth, deliveryNoteController.getNoteById);

// Eliminar un albarán (solo si no está firmado)
router.delete('/:id', auth, deliveryNoteController.deleteNote);

// Firma
router.patch('/sign/:id', auth, uploadSignature.single('firma'), deliveryNoteController.signNote);

// Generar PDF
router.get('/pdf/:id', auth, deliveryNoteController.generatePdf);

module.exports = router;
