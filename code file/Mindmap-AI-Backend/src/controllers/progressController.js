const Material = require('../models/material');
const Progress = require('../models/progress');
const { countNodes } = require('../utils/materialContext');

async function ownMaterial(req, res) {
  const material = await Material.findById(req.params.materialId).select('user title mindMap');
  if (!material) {
    res.status(404).json({ message: 'Material not found' });
    return null;
  }
  if (!material.user.equals(req.user._id)) {
    res.status(403).json({ message: 'Forbidden' });
    return null;
  }
  return material;
}

function masteryOf(progress, material) {
  const total = countNodes(material.mindMap) - 1;
  if (total <= 0) return 0;
  return Math.min(100, Math.round((progress.topicsCompleted.length / total) * 100));
}

exports.getProgress = async (req, res) => {
  const material = await ownMaterial(req, res);
  if (!material) return;

  const progress = await Progress.findOneAndUpdate(
    { user: req.user._id, material: material._id },
    { $setOnInsert: { user: req.user._id, material: material._id } },
    { upsert: true, new: true }
  );
  res.json({ progress, mastery: masteryOf(progress, material) });
};

exports.updateProgress = async (req, res) => {
  const material = await ownMaterial(req, res);
  if (!material) return;

  const { completedTopics = [], uncompletedTopics = [], studyMinutes = 0 } = req.body;
  const filter = { user: req.user._id, material: material._id };

  await Progress.findOneAndUpdate(filter, { $setOnInsert: filter }, { upsert: true });

  const progress = await Progress.findOneAndUpdate(
    filter,
    {
      $addToSet: { topicsCompleted: { $each: completedTopics } },
      $inc: { studyMinutes: Math.max(0, Number(studyMinutes) || 0) },
      $set: { lastStudiedAt: new Date() },
    },
    { new: true }
  );

  if (uncompletedTopics.length) {
    progress.topicsCompleted = progress.topicsCompleted.filter((t) => !uncompletedTopics.includes(t));
    await progress.save();
  }

  res.json({ progress, mastery: masteryOf(progress, material) });
};

exports.recordQuiz = async (req, res) => {
  const material = await ownMaterial(req, res);
  if (!material) return;

  const score = Number(req.body.score);
  const total = Number(req.body.total);
  if (Number.isNaN(score) || Number.isNaN(total) || total <= 0 || score < 0 || score > total)
    return res.status(400).json({ message: 'Valid score and total are required' });

  const filter = { user: req.user._id, material: material._id };
  const progress = await Progress.findOneAndUpdate(
    filter,
    {
      $setOnInsert: filter,
      $push: { quizAttempts: { score, total } },
      $set: { lastStudiedAt: new Date() },
    },
    { upsert: true, new: true }
  );
  res.status(201).json({ progress });
};

exports.getOverview = async (req, res) => {
  const records = await Progress.find({ user: req.user._id }).populate('material', 'title subject mindMap');

  let totalMinutes = 0;
  let attempts = 0;
  let pctSum = 0;

  const materials = records
    .filter((p) => p.material)
    .map((p) => {
      totalMinutes += p.studyMinutes;
      p.quizAttempts.forEach((q) => {
        attempts += 1;
        pctSum += (q.score / q.total) * 100;
      });
      return {
        materialId: p.material._id,
        title: p.material.title,
        subject: p.material.subject,
        topicsCompleted: p.topicsCompleted.length,
        studyMinutes: p.studyMinutes,
        quizzesTaken: p.quizAttempts.length,
        mastery: masteryOf(p, p.material),
        lastStudiedAt: p.lastStudiedAt,
      };
    });

  res.json({
    totalMaterialsTracked: materials.length,
    totalStudyMinutes: totalMinutes,
    averageQuizScore: attempts ? Math.round(pctSum / attempts) : null,
    materials,
  });
};