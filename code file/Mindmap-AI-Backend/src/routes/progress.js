const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/progressController');

router.use(protect);

router.get('/', ctrl.getOverview);
router.get('/:materialId', ctrl.getProgress);
router.put('/:materialId', ctrl.updateProgress);
router.post('/:materialId/quiz', ctrl.recordQuiz);

module.exports = router;