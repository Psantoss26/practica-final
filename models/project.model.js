const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: String,
  deleted: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  empresa: {
    nombre: String,
    cif: String,
    direccion: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
