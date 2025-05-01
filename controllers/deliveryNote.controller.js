const DeliveryNote = require('../models/deliveryNote.model');
const User = require('../models/user.model');
const Client = require('../models/client.model');
const Project = require('../models/project.model');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Crear un albarán
exports.createDeliveryNote = async (req, res) => {
  const { tipo, items, clientId, projectId } = req.body;
  const userId = req.user.id;

  try {
    if (!['horas', 'materiales'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido. Usa "horas" o "materiales"' });
    }

    const client = await Client.findById(clientId);
    const project = await Project.findById(projectId);
    if (!client || !project) {
      return res.status(404).json({ error: 'Cliente o proyecto no encontrado' });
    }

    const note = await DeliveryNote.create({
      tipo,
      items,
      clientId,
      projectId,
      userId
    });

    res.status(201).json({ message: '✅ Albarán creado correctamente', note });
  } catch (err) {
    console.error('Error al crear albarán:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener todos los albaranes (del usuario o su empresa)
exports.getAllNotes = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    const filter = user.empresa
      ? { $or: [{ userId }, { 'empresa.nombre': user.empresa.nombre }] }
      : { userId };

    const notes = await DeliveryNote.find({ ...filter, deleted: false })
      .populate('userId', 'email')
      .populate('clientId', 'nombre email')
      .populate('projectId', 'nombre');

    res.status(200).json({ notes });
  } catch (err) {
    console.error('Error al obtener albaranes:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener un albarán por ID (con populate)
exports.getNoteById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const note = await DeliveryNote.findById(id)
      .populate('userId', 'email')
      .populate('clientId', 'nombre email')
      .populate('projectId', 'nombre');

    if (!note) return res.status(404).json({ error: 'Albarán no encontrado' });

    if (
      note.userId._id.toString() !== userId &&
      req.user.role !== 'guest'
    ) {
      return res.status(403).json({ error: 'No tienes acceso a este albarán' });
    }

    res.status(200).json({ note });
  } catch (err) {
    console.error('Error al obtener albarán:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar (solo si no está firmado)
exports.deleteNote = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const note = await DeliveryNote.findById(id);
    if (!note) return res.status(404).json({ error: 'Albarán no encontrado' });

    if (note.signed) {
      return res.status(400).json({ error: 'No se puede eliminar un albarán firmado' });
    }

    if (note.userId.toString() !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este albarán' });
    }

    await note.deleteOne();
    res.status(200).json({ message: '❌ Albarán eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar albarán:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Firma de albarán
exports.signNote = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const note = await DeliveryNote.findById(id);
    if (!note) return res.status(404).json({ error: 'Albarán no encontrado' });
    if (note.signed) return res.status(400).json({ error: 'Ya está firmado' });

    const filePath = `/firmas/${req.file.filename}`;
    note.firma = filePath;
    note.signed = true;

    await note.save();
    res.status(200).json({ message: '🖊️ Firma guardada correctamente', firma: filePath });
  } catch (err) {
    console.error('Error al firmar albarán:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

// Generar PDF
exports.generatePdf = async (req, res) => {
  const { id } = req.params;

  try {
    const note = await DeliveryNote.findById(id)
      .populate('userId', 'email')
      .populate('clientId', 'nombre email direccion')
      .populate('projectId', 'nombre');

    if (!note) return res.status(404).json({ error: 'Albarán no encontrado' });

    const doc = new PDFDocument();
    const pdfName = `albaran-${note._id}.pdf`;
    const outputPath = path.join(__dirname, `../pdfs/${pdfName}`);
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // --- Contenido del PDF ---
    doc.fontSize(20).text('Albarán de servicio', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Proyecto: ${note.projectId.nombre}`);
    doc.text(`Cliente: ${note.clientId.nombre}`);
    doc.text(`Correo cliente: ${note.clientId.email}`);
    doc.text(`Dirección cliente: ${note.clientId.direccion}`);
    doc.text(`Usuario creador: ${note.userId.email}`);
    doc.text(`Fecha: ${new Date(note.fecha).toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Items:');
    note.items.forEach((item, idx) => {
      doc.fontSize(12).text(
        `${idx + 1}. [${item.tipo}] ${item.descripcion} — Cantidad: ${item.cantidad}`
        + (item.horas ? ` — Horas: ${item.horas}` : '')
        + (item.precio ? ` — Precio: ${item.precio}` : '')
      );
    });
    doc.moveDown();

    // --- Insertar firma si existe ---
    if (note.signed && note.firma) {
      doc.fontSize(14).text('Firma del cliente:');
      const firmaPath = path.join(__dirname, '..', note.firma);

      if (fs.existsSync(firmaPath)) {
        try {
          doc.image(firmaPath, { width: 150 });
        } catch (err) {
          console.warn('⚠️ Firma corrupta o inválida, se omite en el PDF:', err.message);
        }
      } else {
        doc.text('⚠️ Firma no encontrada');
      }
    }

    doc.end();

    stream.on('finish', () => {
      res.download(outputPath, pdfName);
    });
  } catch (err) {
    console.error('Error al generar PDF:', err);
    res.status(500).json({ error: 'Error interno al generar el PDF' });
  }
};
