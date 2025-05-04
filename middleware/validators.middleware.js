const Joi = require('joi');

// Validación de registro de usuario
exports.validateRegister = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Validación del código de verificación por email
exports.validateCode = (req, res, next) => {
  const schema = Joi.object({
    code: Joi.string().length(6).pattern(/^\d+$/).required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Validación de login de usuario
exports.validateLogin = (req, res, next) => {
  const Joi = require('joi');

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  next();
};

// Validación de datos de usuario
exports.validatePersonalData = (req, res, next) => {
  const Joi = require('joi');

  const schema = Joi.object({
    nombre: Joi.string().min(2).required(),
    apellidos: Joi.string().min(2).required(),
    nif: Joi.string().pattern(/^[0-9A-Z]{8,10}$/).required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(422).json({ error: error.details[0].message });

  next();
};

// Validación de datos de empresa o autónomo
exports.validateCompanyData = (req, res, next) => {
  const Joi = require('joi');

  const schema = Joi.object({
    nombre: Joi.string().min(2).required(),
    cif: Joi.string().pattern(/^[A-Z0-9]{8,10}$/).required(),
    direccion: Joi.string().min(5).required(),
    autonomo: Joi.boolean().required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(422).json({ error: error.details[0].message });

  next();
};

  
  