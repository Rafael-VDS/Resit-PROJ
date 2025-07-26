const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Envoie deux fichiers : "file" pour la vidéo et "thumbnail" pour la miniature
router.post('/', auth, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), videoController.createVideo);

// Modifier une vidéo (titre, description, fichier ou miniature)
router.put('/:id', auth, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), videoController.updateVideo);

// Supprimer une vidéo
router.delete('/:id', auth, videoController.deleteVideo);

router.get('/public', videoController.getPublicVideo);
router.get('/private', auth, videoController.getPrivateVideo);
router.get('/user/all', auth, videoController.getAllUserVideos);
router.get('/:id', videoController.getVideoById);

module.exports = router;
