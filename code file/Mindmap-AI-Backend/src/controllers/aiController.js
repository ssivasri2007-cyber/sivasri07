const Material = require('../models/material');
const { generateText, generateJSON } = require('../utils/gemini');
const { buildContext } = require('../utils/materialContext');

async function loadMaterial(req, res) {
  const material = await Material.findById(req.params.materialId);
  if (!material) {
    res.status(404).json({ message: 'Material not found' });
    return null;
  }
  if (!material.user.equals(req.user._id) && req.user.role !== 'admin') {
    res.status(403).json({ message: 'Forbidden' });
    return null;
  }
  return material;
}

exports.generateMindMap = async (req, res) => {
  const material = await loadMaterial(req, res);
  if (!material) return;

  if (material.mindMap && req.query.refresh !== 'true')
    return res.json({ cached: true, mindMap: material.mindMap });

  const prompt = `You are a learning assistant. Build a hierarchical mind map from the study material below.
Return ONLY JSON in exactly this shape:
{"title": "central topic", "children": [{"title": "branch", "summary": "one short sentence", "children": [{"title": "sub-topic", "summary": "one short sentence", "children": []}]}]}
Rules: 4-8 main branches, max depth 3, titles under 6 words.

STUDY MATERIAL (${material.title}):
${buildContext(material)}`;

  const mindMap = await generateJSON(prompt);
  material.mindMap = mindMap;
  material.markModified('mindMap');
  await material.save();
  res.json({ cached: false, mindMap });
};

exports.summarize = async (req, res) => {
  const material = await loadMaterial(req, res);
  if (!material) return;

  const summary = await generateText(
    `Summarize this study material for a student. Give a 3-4 sentence overview, then 5-8 key takeaways as short bullet points.\n\n${buildContext(material)}`
  );
  material.summary = summary;
  await material.save();
  res.json({ summary });
};

exports.generateQuiz = async (req, res) => {
  const material = await loadMaterial(req, res);
  if (!material) return;

  const count = Math.min(Math.max(parseInt(req.body.count, 10) || 5, 1), 15);
  const prompt = `Create ${count} multiple-choice questions from the material below.
Return ONLY JSON: {"questions":[{"question":"...","options":["A","B","C","D"],"answerIndex":0,"explanation":"..."}]}
Each question has exactly 4 options; answerIndex is the 0-based index of the correct option.

MATERIAL:
${buildContext(material)}`;

  const quiz = await generateJSON(prompt);
  res.json(quiz);
};

exports.askQuestion = async (req, res) => {
  const material = await loadMaterial(req, res);
  if (!material) return;

  const { question } = req.body;
  if (!question) return res.status(400).json({ message: 'question is required' });

  const answer = await generateText(
    `Answer the student's question using ONLY the material below. If the material does not cover it, say so and give a brief general hint.

MATERIAL:
${buildContext(material)}

QUESTION: ${question}`
  );
  res.json({ answer });
};

exports.explainTopic = async (req, res) => {
  const { topic, level = 'beginner' } = req.body;
  if (!topic) return res.status(400).json({ message: 'topic is required' });

  const explanation = await generateText(
    `Explain "${topic}" to a ${level} learner. Use simple language, one analogy, and end with 3 self-check questions.`
  );
  res.json({ topic, explanation });
};

exports.generateRoadmap = async (req, res) => {
  const { topic, level = 'beginner' } = req.body;
  if (!topic) return res.status(400).json({ message: 'topic is required' });

  const days = Math.min(Math.max(parseInt(req.body.days, 10) || 7, 1), 60);
  const hoursPerDay = Math.min(Math.max(parseFloat(req.body.hoursPerDay) || 1, 0.5), 12);

  const prompt = `Create a ${days}-day personalized study roadmap for learning "${topic}" at ${level} level, with about ${hoursPerDay} hour(s) per day.
Return ONLY JSON: {"topic":"...","level":"...","days":[{"day":1,"focus":"...","tasks":["..."],"outcome":"..."}]}
The days array must contain exactly ${days} entries.`;

  const roadmap = await generateJSON(prompt);
  res.json(roadmap);
};