const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const playlistController = require('../controllers/playlistController');

// Routes pour les playlists
router.get('/', auth, playlistController.getUserPlaylists);
router.post('/', auth, playlistController.createPlaylist);
router.delete('/:id', auth, playlistController.deletePlaylist);

// Routes pour les vidéos dans les playlists
router.get('/:id/videos', auth, playlistController.getPlaylistVideos);
router.post('/:id/videos', auth, playlistController.addVideoToPlaylist);
router.delete('/:id/videos/:videoId', auth, playlistController.removeVideoFromPlaylist);

module.exports = router;
