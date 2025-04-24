const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const {
    validateRegister,
    validateCode,
    validateLogin,
    validatePersonalData,
    validateCompanyData
} = require('../middleware/validators.middleware');
const upload = require('../middleware/upload.middleware');

// Registro de nuevo usuario
router.post('/register', validateRegister, userController.register);

// Validación de email con código (requiere token)
router.post('/validate', auth, validateCode, userController.validateEmail);

// Login del usuario
router.post('/login', validateLogin, userController.login);

// Actualizar datos personales (nombre, apellidos, NIF)
router.put('/register', auth, validatePersonalData, userController.updatePersonalData);

// Actualizar o registrar datos de compañía
router.patch('/company', auth, validateCompanyData, userController.updateCompanyData);

// Subida o actualización del logo
router.patch('/logo', auth, upload.single('logo'), userController.updateLogo);

// Obtener datos completos del usuario autenticado
router.get('/', auth, userController.getUser);

// Eliminar usuario (soft o hard según query param)
router.delete('/', auth, userController.deleteUser);

// Cambiar contraseña con sesión activa
router.patch('/change-password', auth, userController.changePassword);

// Solicitar código para recuperar contraseña
router.post('/forgot-password', userController.forgotPassword);

// Confirmar código y establecer nueva contraseña
router.patch('/reset-password', userController.resetPassword);

// Invitar a un usuario con rol guest a la empresa del usuario autenticado
router.post('/invite', auth, userController.inviteGuest);

module.exports = router;
