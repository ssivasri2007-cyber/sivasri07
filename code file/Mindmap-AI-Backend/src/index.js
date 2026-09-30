const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('express-async-errors');

const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./utils/db');

const app = express();

fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) =>
  res.json({ name: 'MindMap AI - Your personal learning navigator', status: 'ok' })
);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/materials', require('./routes/material'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/admin', require('./routes/admin'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  let status = err.status || 500;
  let message = err.message || 'Server error';
  if (err.name === 'CastError') { status = 400; message = 'Invalid id'; }
  if (err.name === 'ValidationError') status = 400;
  if (err.code === 11000) { status = 409; message = 'Duplicate value'; }
  if (err.name === 'MulterError') status = 400;
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`MindMap AI API running on http://localhost:${PORT}`));
});