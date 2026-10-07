const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  fileFilter: (req, file, cb) => {
    const nome = file.originalname.toLowerCase();

    if (!nome.endsWith('.csv')) {
      return cb(
        new Error('Apenas arquivos CSV são permitidos.')
      );
    }

    cb(null, true);
  },

  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;