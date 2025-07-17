const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Chemins complets
const videoDir = path.join(__dirname, '..', 'upload', 'video');
const imageDir = path.join(__dirname, '..', 'upload', 'image', 'video_image');

// Crée les dossiers s'ils n'existent pas
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

// Stockage dynamique selon mimetype
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, videoDir);
    } else if (file.mimetype.startsWith('image/')) {
      cb(null, imageDir);
    } else {
      cb(new Error('Type de fichier non supporté'), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });
module.exports = upload;
