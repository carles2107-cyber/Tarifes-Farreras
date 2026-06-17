const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data.sqlite');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    link TEXT NOT NULL UNIQUE,
    source TEXT NOT NULL,
    category TEXT NOT NULL,
    published_at TEXT,
    summary TEXT,
    fetched_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
  CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
`);

const upsertStmt = db.prepare(`
  INSERT INTO articles (title, link, source, category, published_at, summary, fetched_at)
  VALUES (@title, @link, @source, @category, @published_at, @summary, @fetched_at)
  ON CONFLICT(link) DO UPDATE SET
    title = excluded.title,
    source = excluded.source,
    category = excluded.category,
    published_at = excluded.published_at,
    summary = excluded.summary,
    fetched_at = excluded.fetched_at
`);

function upsertArticle(article) {
  return upsertStmt.run(article);
}

function getArticles({ category, page = 1, pageSize = 20 }) {
  const offset = (page - 1) * pageSize;
  let rows;
  let total;

  if (category) {
    rows = db
      .prepare(
        `SELECT * FROM articles WHERE category = ? ORDER BY published_at DESC LIMIT ? OFFSET ?`
      )
      .all(category, pageSize, offset);
    total = db
      .prepare(`SELECT COUNT(*) AS count FROM articles WHERE category = ?`)
      .get(category).count;
  } else {
    rows = db
      .prepare(`SELECT * FROM articles ORDER BY published_at DESC LIMIT ? OFFSET ?`)
      .all(pageSize, offset);
    total = db.prepare(`SELECT COUNT(*) AS count FROM articles`).get().count;
  }

  return { rows, total };
}

function getCategoryCounts() {
  return db
    .prepare(`SELECT category, COUNT(*) AS count FROM articles GROUP BY category`)
    .all();
}

module.exports = {
  db,
  upsertArticle,
  getArticles,
  getCategoryCounts,
};
