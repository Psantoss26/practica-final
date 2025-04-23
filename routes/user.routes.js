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

router.post('/register', validateRegister, userController.register);
router.post('/validate', auth, validateCode, userController.validateEmail);
router.post('/login', validateLogin, userController.login);
router.put('/register', auth, validatePersonalData, userController.updatePersonalData);
router.patch('/company', auth, validateCompanyData, userController.updateCompanyData);
router.patch('/logo', auth, upload.single('logo'), userController.updateLogo);
router.get('/', auth, userController.getUser);
router.delete('/', auth, userController.deleteUser);

router.patch('/change-password', auth, userController.changePassword);
router.post('/forgot-password', userController.forgotPassword);
router.patch('/reset-password', userController.resetPassword);
router.post('/invite', auth, userController.inviteGuest);

module.exports = router;
