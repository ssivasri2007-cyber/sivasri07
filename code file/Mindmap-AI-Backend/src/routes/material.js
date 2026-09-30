const router = require('express').Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/materialController');

router.use(protect);

router.post('/', upload.single('file'), ctrl.createMaterial);
router.get('/', ctrl.getMaterials);
router.get('/:id', ctrl.getMaterial);
router.put('/:id', ctrl.updateMaterial);
router.delete('/:id', ctrl.deleteMaterial);

module.exports = router;