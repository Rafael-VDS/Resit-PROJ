const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dossiers de destination
const videoDir = path.join(__dirname, '..', '..', 'upload', 'video');
const videoImageDir = path.join(__dirname, '..', '..', 'upload', 'image', 'video_image');
const profileImageDir = path.join(__dirname, '..', '..', 'upload', 'image');

// Création des dossiers si pas existants
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
if (!fs.existsSync(videoImageDir)) fs.mkdirSync(videoImageDir, { recursive: true });
if (!fs.existsSync(profileImageDir)) fs.mkdirSync(profileImageDir, { recursive: true });

// Logique de destination dynamique
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, videoDir);
    } else if (file.mimetype.startsWith('image/')) {
      // Si c'est une image de profil (fieldname = profileImage)
      if (file.fieldname === 'profileImage') {
        cb(null, profileImageDir);
      } else {
        // Sinon, c'est une thumbnail de vidéo
        cb(null, videoImageDir);
      }
    } else {
      cb(new Error('Fichier non supporté'), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

module.exports = upload;
