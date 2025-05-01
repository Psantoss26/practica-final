// middleware/uploadSignature.middleware.js
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Definimos la carpeta donde se guardarán las firmas
const uploadDir = path.join(__dirname, '..', 'firmas');

// Si no existe, la creamos (recursivamente)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.png', '.jpg', '.jpeg'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'));
  }
};

const uploadSignature = multer({ storage, fileFilter });
module.exports = uploadSignature;
