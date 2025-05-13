const Client = require('../models/client.model');
const User = require('../models/user.model');

// Crear cliente
exports.createClient = async (req, res) => {
  const { nombre, email, telefono, direccion } = req.body;
  const userId = req.user.id;

  try {
    // 1) Verificar usuario
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // 2) Verificar duplicado
    const existing = await Client.findOne({ nombre, userId });
    if (existing) return res.status(409).json({ error: 'El cliente ya existe para este usuario' });

    // 3) Crear cliente
    const client = await Client.create({
      nombre,
      email,
      telefono,
      direccion,
      userId,
      empresa: user.empresa || null,
      projects: [] // inicializamos array de proyectos
    });

    // 4) Asociar cliente al usuario
    user.clients = user.clients || [];
    user.clients.push(client._id);
    await user.save();

    // 5) Responder
    res.status(201).json({ message: '✅ Cliente creado y asociado al usuario', client });
  } catch (err) {
    console.error('Error al crear cliente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

// Actualizar cliente
exports.updateClient = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, telefono, direccion } = req.body;
  const userId = req.user.id;

  try {
    const client = await Client.findOneAndUpdate(
      { _id: id, userId },
      { nombre, email, telefono, direccion },
      { new: true }
    );

    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.status(200).json({ message: '📝 Cliente actualizado', client });
  } catch (err) {
    console.error('Error al actualizar cliente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

// Obtener todos los clientes del usuario o su empresa
exports.getClients = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    const filter = user.empresa
      ? { $or: [{ userId }, { 'empresa.nombre': user.empresa.nombre }] }
      : { userId };

    const clients = await Client.find({ ...filter, deleted: false });
    res.status(200).json({ clients });
  } catch (err) {
    console.error('Error al obtener clientes:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

// Obtener cliente por ID
exports.getClientById = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const user = await User.findById(userId);
    const filter = user.empresa
      ? { _id: id, $or: [{ userId }, { 'empresa.nombre': user.empresa.nombre }] }
      : { _id: id, userId };

    const client = await Client.findOne(filter);
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.status(200).json({ client });
  } catch (err) {
    console.error('Error al obtener cliente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

// Soft delete
exports.archiveClient = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const client = await Client.findOneAndUpdate(
      { _id: id, userId },
      { deleted: true },
      { new: true }
    );
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.status(200).json({ message: '🗂️ Cliente archivado' });
  } catch (err) {
    console.error('Error al archivar cliente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

// Hard delete
exports.deleteClient = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await Client.findOneAndDelete({ _id: id, userId });
    if (!result) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.status(200).json({ message: '❌ Cliente eliminado definitivamente' });
  } catch (err) {
    console.error('Error al eliminar cliente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

// Listar archivados
exports.getArchivedClients = async (req, res) => {
  const userId = req.user.id;

  try {
    const clients = await Client.find({ userId, deleted: true });
    res.status(200).json({ clients });
  } catch (err) {
    console.error('Error al obtener clientes archivados:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

// Recuperar cliente archivado
exports.recoverClient = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const client = await Client.findOneAndUpdate(
      { _id: id, userId },
      { deleted: false },
      { new: true }
    );
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.status(200).json({ message: '✅ Cliente recuperado', client });
  } catch (err) {
    console.error('Error al recuperar cliente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};
