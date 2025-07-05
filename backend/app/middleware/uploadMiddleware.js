const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 📁 Chemin du dossier où stocker les images
const imageDir = path.join(__dirname, '..', 'upload', 'image', 'profile_picture');

// 📦 Crée le dossier s'il n'existe pas
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// 📤 Configuration du stockage avec nom unique
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// 📎 Middleware Multer prêt à être utilisé dans les routes
module.exports = multer({ storage });
