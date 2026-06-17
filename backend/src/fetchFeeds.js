const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const { upsertArticle } = require('./db');

const parser = new Parser({
  timeout: 15000,
});

function loadFeeds() {
  const feedsPath = path.join(__dirname, '..', 'feeds.json');
  const raw = fs.readFileSync(feedsPath, 'utf-8');
  return JSON.parse(raw);
}

function truncate(text, max = 300) {
  if (!text) return '';
  const clean = text.replace(/<[^>]*>/g, '').trim();
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}

async function fetchFeed(feed) {
  try {
    const parsed = await parser.parseURL(feed.url);
    const fetchedAt = new Date().toISOString();
    let count = 0;

    for (const item of parsed.items || []) {
      const link = item.link || item.guid;
      if (!link) continue;

      const publishedAt = item.isoDate || item.pubDate || fetchedAt;

      upsertArticle({
        title: item.title || '(sin titulo)',
        link,
        source: feed.source,
        category: feed.category,
        published_at: new Date(publishedAt).toISOString(),
        summary: truncate(item.contentSnippet || item.summary || item.content),
        fetched_at: fetchedAt,
      });
      count += 1;
    }

    console.log(`[feeds] OK  ${feed.source} (${feed.category}) -> ${count} articles`);
  } catch (err) {
    console.error(`[feeds] FAIL ${feed.source} (${feed.url}): ${err.message}`);
  }
}

async function refreshAllFeeds() {
  const feeds = loadFeeds();
  console.log(`[feeds] Refreshing ${feeds.length} feeds...`);
  await Promise.all(feeds.map(fetchFeed));
  console.log('[feeds] Refresh complete.');
}

module.exports = { refreshAllFeeds, loadFeeds };
