// models/user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  role:         { type: String, default: 'user' },
  isValidated:  { type: Boolean, default: false },
  emailCode:    { type: String },
  emailAttempts:{ type: Number, default: 0 },
  resetCode:    { type: String },
  resetAttempts:{ type: Number, default: 0 },
  deleted:      { type: Boolean, default: false },

  logo:         { type: String },
  
  nombre:       { type: String },
  apellidos:    { type: String },
  nif:          { type: String },

  empresa: {
    nombre:     { type: String },
    cif:        { type: String },
    direccion:  { type: String }
  },

  clients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }]
}, { timestamps: true });

// Para que tests hagan `u.code` y apunten a `emailCode`
userSchema.virtual('code').get(function(){
  return this.emailCode;
});
userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON',   { virtuals: true });

module.exports = mongoose.model('User', userSchema);
