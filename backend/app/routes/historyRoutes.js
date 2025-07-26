const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const historyController = require('../controllers/historyController');

router.post('/', auth, historyController.addToHistory);
router.put('/:id', auth, historyController.updateHistory);
router.delete('/:video_id', auth, historyController.deleteHistory);
router.delete('/', auth, historyController.clearAllHistory);
router.get('/', auth, historyController.getUserHistory);

module.exports = router;
