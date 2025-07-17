const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, subscriptionController.createSubscription);
router.put('/:id', auth, subscriptionController.updateSubscription);
router.delete('/:id', auth, subscriptionController.deleteSubscription);

module.exports = router;
