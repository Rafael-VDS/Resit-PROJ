const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const playlistController = require('../controllers/playlistController');

router.post('/', auth, playlistController.createPlaylist);
router.put('/:id_playlist', auth, playlistController.updatePlaylist);
router.delete('/:id_playlist', auth, playlistController.deletePlaylist);
router.post('/:id_playlist/videos', auth, playlistController.addVideoToPlaylist);
router.delete('/:id_playlist/videos/:id_video', auth, playlistController.removeVideoFromPlaylist);

module.exports = router;
