const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const systemsRoutes = require('./routes/systems');
const rutgersRoutes = require('./routes/rutgers');
const { errorHandler, notFoundHandler } = require('./utils/errors');

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/systems', systemsRoutes);
app.use('/api/rutgers', rutgersRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
