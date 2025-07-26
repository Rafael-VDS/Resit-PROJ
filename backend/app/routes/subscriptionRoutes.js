const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, subscriptionController.getUserSubscriptions);
router.get('/status/:channel_id', auth, subscriptionController.getSubscriptionStatus);
router.get('/count/:channel_id', subscriptionController.getSubscribersCount);
router.post('/', auth, subscriptionController.createSubscription);
router.put('/:id', auth, subscriptionController.updateSubscription);
router.delete('/:channel_id', auth, subscriptionController.deleteSubscription);

module.exports = router;
