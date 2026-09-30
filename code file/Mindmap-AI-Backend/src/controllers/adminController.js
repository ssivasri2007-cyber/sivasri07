const fs = require('fs');
const User = require('../models/user');
const Material = require('../models/material');
const Progress = require('../models/progress');

exports.getStats = async (req, res) => {
  const [users, materials, progressRecords] = await Promise.all([
    User.countDocuments(),
    Material.countDocuments(),
    Progress.countDocuments(),
  ]);
  res.json({ users, materials, progressRecords });
};

exports.listUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ count: users.length, users });
};

exports.updateRole = async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role))
    return res.status(400).json({ message: "role must be 'user' or 'admin'" });

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
};

exports.deleteUser = async (req, res) => {
  if (req.params.id === String(req.user._id))
    return res.status(400).json({ message: 'You cannot delete yourself' });

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const materials = await Material.find({ user: user._id }).select('filePath');
  materials.forEach((m) => m.filePath && fs.unlink(m.filePath, () => {}));
  await Material.deleteMany({ user: user._id });
  await Progress.deleteMany({ user: user._id });
  await user.deleteOne();

  res.json({ message: 'User and related data deleted' });
};