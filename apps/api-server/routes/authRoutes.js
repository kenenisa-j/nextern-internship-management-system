const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/status', verifyToken, authController.getStatus);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Reviewer Demo Login System
router.get('/demo-accounts', authController.getDemoAccounts);
router.post('/demo-login', authController.demoLogin);
router.post('/seed-demo', authController.seedDemoEndpoint);

module.exports = router;
