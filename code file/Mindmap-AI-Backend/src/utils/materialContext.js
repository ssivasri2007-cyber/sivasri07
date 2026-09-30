const fs = require('fs');
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

const MAX_CONTEXT_CHARS = 30000;

async function extractText(filePath, mimeType, originalName = '') {
  const isPdf = mimeType === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf');
  if (isPdf) {
    const data = await pdfParse(fs.readFileSync(filePath));
    return (data.text || '').trim();
  }
  return fs.readFileSync(filePath, 'utf8').trim();
}

function buildContext(material, maxChars = MAX_CONTEXT_CHARS) {
  const text = material.content || '';
  return text.length > maxChars ? text.slice(0, maxChars) + '\n...[truncated]' : text;
}

function countNodes(node) {
  if (!node) return 0;
  const kids = node.children || [];
  return 1 + kids.reduce((n, c) => n + countNodes(c), 0);
}

module.exports = { extractText, buildContext, countNodes };