const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const commentController = require('../controllers/commentController');

router.post('/', auth, commentController.createComment);
router.put('/:id', auth, commentController.updateComment);
router.delete('/:id', auth, commentController.deleteComment);
router.get('/:id', commentController.getComments);

module.exports = router;
