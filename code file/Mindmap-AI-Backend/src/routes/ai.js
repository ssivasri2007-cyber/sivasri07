const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/aiController');

router.use(protect);
router.use(rateLimit({ windowMs: 60 * 1000, max: 20, message: { message: 'Too many AI requests, slow down' } }));

router.post('/mindmap/:materialId', ctrl.generateMindMap);
router.post('/summary/:materialId', ctrl.summarize);
router.post('/quiz/:materialId', ctrl.generateQuiz);
router.post('/ask/:materialId', ctrl.askQuestion);
router.post('/explain', ctrl.explainTopic);
router.post('/roadmap', ctrl.generateRoadmap);

module.exports = router;