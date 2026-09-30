const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, trim: true, default: 'General' },
    description: { type: String, trim: true },
    sourceType: { type: String, enum: ['text', 'file'], default: 'text' },
    content: { type: String, required: true },
    fileName: String,
    filePath: String,
    mimeType: String,
    summary: String,
    mindMap: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);