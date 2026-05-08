import cors = require('cors');
import express = require('express');
import type { ErrorRequestHandler } from 'express';
import jobRoutes = require('./routes/job.routes');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/jobs', jobRoutes);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const errorStatus = (error as { status?: unknown }).status;
  const status = typeof errorStatus === 'number' && errorStatus >= 400 && errorStatus < 500 ? errorStatus : 500;

  res.status(status).json({ error: status === 500 ? 'Internal server error' : 'Invalid request body' });
};

app.use(errorHandler);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`Job Match API listening on port ${port}`);
});