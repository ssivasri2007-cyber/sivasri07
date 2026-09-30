const { GoogleGenerativeAI } = require('@google/generative-ai');

function getModel(asJson) {
  if (!process.env.GEMINI_API_KEY) {
    const e = new Error('GEMINI_API_KEY is missing in .env');
    e.status = 500;
    throw e;
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    generationConfig: asJson ? { responseMimeType: 'application/json' } : {},
  });
}

async function generateText(prompt) {
  try {
    const result = await getModel(false).generateContent(prompt);
    return result.response.text();
  } catch (err) {
    err.status = err.status || 502;
    err.message = 'AI error: ' + err.message;
    throw err;
  }
}

async function generateJSON(prompt) {
  try {
    const result = await getModel(true).generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    err.status = err.status || 502;
    err.message = 'AI error: ' + err.message;
    throw err;
  }
}

module.exports = { generateText, generateJSON };