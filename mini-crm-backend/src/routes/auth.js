const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { auth, requireRole } = require('../middleware/auth');
const { auth: rules } = require('../utils/validation');

router.post('/register', auth, requireRole('admin'), rules.register, ctrl.register);
router.post('/login', rules.login, ctrl.login);
router.post('/refresh', rules.refresh, ctrl.refresh);
router.post('/logout', ctrl.logout);

// User management routes (admin only)
router.get('/users', auth, requireRole('admin'), ctrl.listUsers);
router.patch('/users/:id', auth, requireRole('admin'), ctrl.updateUser);
router.delete('/users/:id', auth, requireRole('admin'), ctrl.deleteUser);

module.exports = router;
