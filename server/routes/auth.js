const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/user/profile', auth, authController.getProfile);
router.put('/customers/:id', auth, authController.updateCustomer);

module.exports = router;