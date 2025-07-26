const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', upload.none(), userController.register);
router.post('/login', upload.none(), userController.login);
router.get('/me', auth, userController.getProfile);
router.get('/by-username/:username', userController.getUserByUsername);
router.put('/me', auth, upload.single('profileImage'), userController.updateProfile);
router.post('/verify-password', auth, upload.none(), userController.verifyPassword);
router.put('/change-password', auth, upload.none(), userController.changePassword);
router.delete('/me', auth, userController.deleteUser);

module.exports = router;
