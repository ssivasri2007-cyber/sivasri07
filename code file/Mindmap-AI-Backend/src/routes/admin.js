const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/stats', ctrl.getStats);
router.get('/users', ctrl.listUsers);
router.patch('/users/:id/role', ctrl.updateRole);
router.delete('/users/:id', ctrl.deleteUser);

module.exports = router;