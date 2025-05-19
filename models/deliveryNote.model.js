const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['hora', 'material'], required: true },
  descripcion: { type: String, required: true },
  cantidad: { type: Number, required: true },
  horas: { type: Number },       // Solo para tipo 'hora'
  precio: { type: Number },      // Precio por unidad o por hora
}, { _id: false });

const deliveryNoteSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['horas', 'materiales'], required: true }, // tipo general del albarán
  items: [itemSchema],  // Array de personas con horas o materiales

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },

  fecha: { type: Date, default: Date.now },

  signed: { type: Boolean, default: false },
  firma: { type: String },
  pdfUrl: { type: String },
  deleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('DeliveryNote', deliveryNoteSchema);
