const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const auth = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Proyecto
 *   description: Endpoints relacionados con la gestión de proyectos
 */

/**
 * @swagger
 * /api/project:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Proyecto]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, clientId]
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               clientId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Proyecto creado correctamente
 *       409:
 *         description: Proyecto duplicado
 */
router.post('/', auth, projectController.createProject);

/**
 * @swagger
 * /api/project/{id}:
 *   put:
 *     summary: Actualizar proyecto
 *     tags: [Proyecto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *       404:
 *         description: Proyecto no encontrado
 */
router.put('/:id', auth, projectController.updateProject);

/**
 * @swagger
 * /api/project:
 *   get:
 *     summary: Obtener todos los proyectos del usuario o su empresa
 *     tags: [Proyecto]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 */
router.get('/', auth, projectController.getProjects);

/**
 * @swagger
 * /api/project/{id}:
 *   get:
 *     summary: Obtener un proyecto por ID
 *     tags: [Proyecto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *       404:
 *         description: Proyecto no encontrado
 */
router.get('/:id', auth, projectController.getProjectById);

/**
 * @swagger
 * /api/project/{id}/archive:
 *   patch:
 *     summary: Archivar proyecto (soft delete)
 *     tags: [Proyecto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto archivado
 */
router.patch('/:id/archive', auth, projectController.archiveProject);

/**
 * @swagger
 * /api/project/{id}:
 *   delete:
 *     summary: Eliminar proyecto definitivamente (hard delete)
 *     tags: [Proyecto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto eliminado
 */
router.delete('/:id', auth, projectController.deleteProject);

/**
 * @swagger
 * /api/project/archived/list:
 *   get:
 *     summary: Obtener proyectos archivados
 *     tags: [Proyecto]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados
 */
router.get('/archived/list', auth, projectController.getArchivedProjects);

/**
 * @swagger
 * /api/project/{id}/recover:
 *   patch:
 *     summary: Recuperar un proyecto archivado
 *     tags: [Proyecto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto recuperado
 */
router.patch('/:id/recover', auth, projectController.recoverProject);

module.exports = router;
