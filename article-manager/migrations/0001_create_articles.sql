
-- migrations/0001_create_articles.sql
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  published BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- サンプルデータの挿入
INSERT INTO articles (title, content, author, published) VALUES
  ('Cloudflare Workersの基礎', 'エッジコンピューティングの世界へようこそ...', '技術太郎', true),
  ('Next.jsとOpenNextの活用', 'モダンなフレームワークをエッジで動かす...', '開発花子', true);
