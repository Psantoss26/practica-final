const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: String,
  telefono: String,
  direccion: String,
  deleted: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  empresa: {
    nombre: String,
    cif: String,
    direccion: String
  },
  clients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }]

}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
