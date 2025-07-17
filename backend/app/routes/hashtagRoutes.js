const express = require('express');
const router = express.Router();
const hashtagController = require('../controllers/hashtagController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, hashtagController.createHashtag);
router.put('/:id', auth, hashtagController.updateHashtag);
router.delete('/:id', auth, hashtagController.deleteHashtag);

module.exports = router;
