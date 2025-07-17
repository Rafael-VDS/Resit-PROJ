const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', auth, upload.single('image'), channelController.createChannel);
router.put('/:id', auth, upload.single('image'), channelController.updateChannel);
router.delete('/:id', auth, channelController.deleteChannel);

module.exports = router;
