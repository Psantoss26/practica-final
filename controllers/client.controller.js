const Client = require("../models/client.model");

exports.createClient = async (req, res) => {
  try {
    const { name, email, phone, company } = req.body;
    const existing = await Client.findOne({ name, createdBy: req.user.id });

    if (existing) return res.status(409).json({ message: "Ya existe el cliente" });

    const client = new Client({ name, email, phone, company, createdBy: req.user.id });
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: "Error creando cliente" });
  }
};

exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find({ createdBy: req.user.id, isDeleted: false });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo clientes" });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: "Error buscando cliente" });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const updated = await Client.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error actualizando cliente" });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    await Client.findOneAndUpdate({ _id: req.params.id, createdBy: req.user.id }, { isDeleted: true });
    res.json({ message: "Cliente archivado" });
  } catch (error) {
    res.status(500).json({ message: "Error archivando cliente" });
  }
};

exports.hardDeleteClient = async (req, res) => {
  try {
    await Client.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    res.json({ message: "Cliente eliminado permanentemente" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando cliente" });
  }
};

exports.getArchivedClients = async (req, res) => {
  try {
    const clients = await Client.find({ createdBy: req.user.id, isDeleted: true });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo archivados" });
  }
};

exports.restoreClient = async (req, res) => {
  try {
    await Client.findOneAndUpdate({ _id: req.params.id, createdBy: req.user.id }, { isDeleted: false });
    res.json({ message: "Cliente restaurado" });
  } catch (error) {
    res.status(500).json({ message: "Error restaurando cliente" });
  }
};
