const Project = require('../models/project.model');
const User = require('../models/user.model');
const Client = require('../models/client.model');

// Crear proyecto
exports.createProject = async (req, res) => {
  const { nombre, descripcion, clientId } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

    // Verificar duplicado
    const existing = await Project.findOne({ nombre, userId, clientId });
    if (existing) return res.status(409).json({ error: 'Ya existe un proyecto con ese nombre para este cliente' });

    const project = await Project.create({
      nombre,
      descripcion,
      clientId,
      userId,
      empresa: user.empresa || null
    });

    res.status(201).json({ message: '✅ Proyecto creado', project });
  } catch (err) {
    console.error('Error al crear proyecto:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar proyecto
exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  const userId = req.user.id;

  try {
    const project = await Project.findOneAndUpdate(
      { _id: id, userId },
      { nombre, descripcion },
      { new: true }
    );

    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    res.status(200).json({ message: '📝 Proyecto actualizado', project });
  } catch (err) {
    console.error('Error al actualizar proyecto:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener todos los proyectos
exports.getProjects = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    const filter = user.empresa
      ? { $or: [{ userId }, { 'empresa.nombre': user.empresa.nombre }] }
      : { userId };

    const projects = await Project.find({ ...filter, deleted: false });
    res.status(200).json({ projects });
  } catch (err) {
    console.error('Error al obtener proyectos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener un proyecto por ID
exports.getProjectById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    const filter = user.empresa
      ? { _id: id, $or: [{ userId }, { 'empresa.nombre': user.empresa.nombre }] }
      : { _id: id, userId };

    const project = await Project.findOne(filter);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    res.status(200).json({ project });
  } catch (err) {
    console.error('Error al obtener proyecto:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Archivar (soft delete)
exports.archiveProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const project = await Project.findOneAndUpdate(
      { _id: id, userId },
      { deleted: true },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    res.status(200).json({ message: '🗂️ Proyecto archivado' });
  } catch (err) {
    console.error('Error al archivar proyecto:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar proyecto (hard delete)
exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await Project.findOneAndDelete({ _id: id, userId });
    if (!result) return res.status(404).json({ error: 'Proyecto no encontrado' });

    res.status(200).json({ message: '❌ Proyecto eliminado definitivamente' });
  } catch (err) {
    console.error('Error al eliminar proyecto:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener archivados
exports.getArchivedProjects = async (req, res) => {
  const userId = req.user.id;

  try {
    const projects = await Project.find({ userId, deleted: true });
    res.status(200).json({ projects });
  } catch (err) {
    console.error('Error al obtener proyectos archivados:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Recuperar proyecto archivado
exports.recoverProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const project = await Project.findOneAndUpdate(
      { _id: id, userId },
      { deleted: false },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    res.status(200).json({ message: '✅ Proyecto recuperado', project });
  } catch (err) {
    console.error('Error al recuperar proyecto:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
