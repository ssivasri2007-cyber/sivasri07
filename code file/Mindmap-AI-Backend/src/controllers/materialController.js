const fs = require('fs');
const Material = require("../models/material");
const Progress = require("../models/progress");
const { extractText } = require("../utils/materialContext");

const canAccess = (material, user) =>
  material.user.equals(user._id) || user.role === 'admin';

function removeFile(p) {
  if (p) fs.unlink(p, () => {});
}

exports.createMaterial = async (req, res) => {
  const { title, subject, description } = req.body;
  let content = (req.body.content || '').trim();

  if (!title) {
    removeFile(req.file && req.file.path);
    return res.status(400).json({ message: 'title is required' });
  }

  if (req.file) {
    try {
      content = await extractText(req.file.path, req.file.mimetype, req.file.originalname);
    } catch (e) {
      removeFile(req.file.path);
      return res.status(422).json({ message: 'Could not read the uploaded file' });
    }
  }

  if (!content) {
    removeFile(req.file && req.file.path);
    return res.status(400).json({ message: 'Provide text content or upload a readable file' });
  }

  const material = await Material.create({
    user: req.user._id,
    title,
    subject,
    description,
    content,
    sourceType: req.file ? 'file' : 'text',
    fileName: req.file && req.file.originalname,
    filePath: req.file && req.file.path,
    mimeType: req.file && req.file.mimetype,
  });

  res.status(201).json({ material });
};

exports.getMaterials = async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.subject) filter.subject = req.query.subject;
  const materials = await Material.find(filter)
    .select('-content -mindMap')
    .sort({ createdAt: -1 });
  res.json({ count: materials.length, materials });
};

exports.getMaterial = async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) return res.status(404).json({ message: 'Material not found' });
  if (!canAccess(material, req.user)) return res.status(403).json({ message: 'Forbidden' });
  res.json({ material });
};

exports.updateMaterial = async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) return res.status(404).json({ message: 'Material not found' });
  if (!canAccess(material, req.user)) return res.status(403).json({ message: 'Forbidden' });

  ['title', 'subject', 'description', 'content'].forEach((f) => {
    if (req.body[f] !== undefined) material[f] = req.body[f];
  });
  if (req.body.content !== undefined) {
    material.mindMap = null;
    material.summary = undefined;
  }
  await material.save();
  res.json({ material });
};

exports.deleteMaterial = async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) return res.status(404).json({ message: 'Material not found' });
  if (!canAccess(material, req.user)) return res.status(403).json({ message: 'Forbidden' });

  removeFile(material.filePath);
  await Progress.deleteMany({ material: material._id });
  await material.deleteOne();
  res.json({ message: 'Material deleted' });
};