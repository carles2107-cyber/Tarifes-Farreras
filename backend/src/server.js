require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const { getArticles, getCategoryCounts } = require('./db');
const { CATEGORIES } = require('./categories');
const { refreshAllFeeds } = require('./fetchFeeds');

const app = express();
const PORT = process.env.PORT || 3001;
const REFRESH_INTERVAL_MINUTES = parseInt(process.env.REFRESH_INTERVAL_MINUTES, 10) || 30;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/news', (req, res) => {
  const { category } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 20, 1), 100);

  const validCategory =
    category && CATEGORIES.some((c) => c.key === category) ? category : undefined;

  const { rows, total } = getArticles({ category: validCategory, page, pageSize });

  res.json({
    items: rows,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize) || 1,
  });
});

app.get('/api/categories', (req, res) => {
  const counts = getCategoryCounts();
  const countsByKey = Object.fromEntries(counts.map((c) => [c.category, c.count]));

  const categories = CATEGORIES.map((c) => ({
    key: c.key,
    label: c.label,
    count: countsByKey[c.key] || 0,
  }));

  res.json({ categories });
});

app.listen(PORT, () => {
  console.log(`[server] Listening on port ${PORT}`);

  // Initial fetch on startup, then on a recurring schedule.
  refreshAllFeeds();

  const cronExpression = `*/${REFRESH_INTERVAL_MINUTES} * * * *`;
  cron.schedule(cronExpression, () => {
    refreshAllFeeds();
  });

  console.log(
    `[server] Feed refresh scheduled every ${REFRESH_INTERVAL_MINUTES} minute(s).`
  );
});
