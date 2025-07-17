const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, likeController.likeVideo);
router.delete('/:id_video', auth, likeController.unlikeVideo);
router.get('/count/:id_video', likeController.countLikes);

module.exports = router;
