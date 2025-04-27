const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'firmas/');
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (['.png', '.jpg', '.jpeg'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'));
  }
};

const uploadSignature = multer({ storage, fileFilter });
module.exports = uploadSignature;
