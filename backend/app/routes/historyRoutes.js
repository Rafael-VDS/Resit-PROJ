const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const historyController = require('../controllers/historyController');

router.post('/', auth, historyController.addToHistory);
router.put('/:id_history', auth, historyController.updateHistory);
router.delete('/:id_video', auth, historyController.deleteHistory);
router.get('/', auth, historyController.getUserHistory);

module.exports = router;
