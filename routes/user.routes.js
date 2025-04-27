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

/**
 * @swagger
 * tags:
 *   name: Usuario
 *   description: Endpoints relacionados con usuarios y autenticación
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Usuario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       409:
 *         description: Email ya registrado
 */
router.post('/register', validateRegister, userController.register);

/**
 * @swagger
 * /api/user/validate:
 *   post:
 *     summary: Validar el correo del usuario
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email validado correctamente
 *       400:
 *         description: Código incorrecto o ya validado
 */
router.post('/validate', auth, validateCode, userController.validateEmail);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Usuario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso con token
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', validateLogin, userController.login);

/**
 * @swagger
 * /api/user/register:
 *   put:
 *     summary: Actualizar datos personales del usuario
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, apellidos, nif]
 *             properties:
 *               nombre:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               nif:
 *                 type: string
 *     responses:
 *       200:
 *         description: Datos personales actualizados
 */
router.put('/register', auth, validatePersonalData, userController.updatePersonalData);

/**
 * @swagger
 * /api/user/company:
 *   patch:
 *     summary: Actualizar o registrar datos de compañía
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               cif:
 *                 type: string
 *               direccion:
 *                 type: string
 *               autonomo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Datos de la compañía actualizados
 */
router.patch('/company', auth, validateCompanyData, userController.updateCompanyData);

/**
 * @swagger
 * /api/user/logo:
 *   patch:
 *     summary: Subir o actualizar el logo del usuario
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo actualizado correctamente
 */
router.patch('/logo', auth, upload.single('logo'), userController.updateLogo);

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Obtener datos del usuario autenticado
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 */
router.get('/', auth, userController.getUser);

/**
 * @swagger
 * /api/user:
 *   delete:
 *     summary: Eliminar usuario (soft o hard)
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: soft
 *         schema:
 *           type: boolean
 *         description: true para soft delete, false para hard delete
 *     responses:
 *       200:
 *         description: Usuario eliminado
 */
router.delete('/', auth, userController.deleteUser);

/**
 * @swagger
 * /api/user/change-password:
 *   patch:
 *     summary: Cambiar contraseña del usuario autenticado
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 */
router.patch('/change-password', auth, userController.changePassword);

/**
 * @swagger
 * /api/user/forgot-password:
 *   post:
 *     summary: Solicitar código de recuperación de contraseña
 *     tags: [Usuario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Código enviado por correo
 */
router.post('/forgot-password', userController.forgotPassword);

/**
 * @swagger
 * /api/user/reset-password:
 *   patch:
 *     summary: Establecer nueva contraseña con código
 *     tags: [Usuario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña restablecida
 */
router.patch('/reset-password', userController.resetPassword);

/**
 * @swagger
 * /api/user/invite:
 *   post:
 *     summary: Invitar a un usuario guest a la empresa
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invitación enviada
 */
router.post('/invite', auth, userController.inviteGuest);

module.exports = router;
