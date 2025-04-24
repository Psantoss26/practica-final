const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const auth = require('../middleware/auth.middleware');

// Crear proyecto
router.post('/', auth, projectController.createProject);

// Actualizar proyecto
router.put('/:id', auth, projectController.updateProject);

// Obtener todos los proyectos del usuario o empresa
router.get('/', auth, projectController.getProjects);

// Obtener un proyecto por ID
router.get('/:id', auth, projectController.getProjectById);

// Archivar proyecto (soft delete)
router.patch('/:id/archive', auth, projectController.archiveProject);

// Eliminar proyecto (hard delete)
router.delete('/:id', auth, projectController.deleteProject);

// Listar proyectos archivados
router.get('/archived/list', auth, projectController.getArchivedProjects);

// Recuperar proyecto archivado
router.patch('/:id/recover', auth, projectController.recoverProject);

module.exports = router;
