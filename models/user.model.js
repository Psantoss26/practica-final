const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: String,
  role: { type: String, default: 'user' },
  isValidated: { type: Boolean, default: false },
  emailCode: String,
  emailAttempts: Number,
  resetCode: String,
  resetAttempts: { type: Number, default: 0 },
  deleted: { type: Boolean, default: false },

  logo: String,
  
  nombre: String,
  apellidos: String,
  nif: String,

  empresa: {
    nombre: String,
    cif: String,
    direccion: String
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
