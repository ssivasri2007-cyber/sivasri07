const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    topicsCompleted: [String],
    studyMinutes: { type: Number, default: 0 },
    quizAttempts: [
      {
        score: Number,
        total: Number,
        date: { type: Date, default: Date.now },
      },
    ],
    lastStudiedAt: Date,
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, material: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);