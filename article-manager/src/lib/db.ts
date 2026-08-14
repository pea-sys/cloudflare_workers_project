// src/lib/db.ts
import { Article } from "../types/database";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cache } from "react";

// Cloudflareのバインディングにアクセス
export const getDatabase = cache(async (): Promise<D1Database> => {
  const { env } = await getCloudflareContext({ async: true }); // 静的生成に必要な設定
  if (!env.DB) {
    throw new Error("Database binding not found");
  }
  return env.DB;
});

export async function getAllArticles(): Promise<Article[]> {
  const db = await getDatabase();
  const result = await db
    .prepare(
      "SELECT * FROM articles WHERE published = true ORDER BY created_at DESC",
    )
    .all<Article>();
  return result.results;
}

export async function getArticleById(id: number): Promise<Article | null> {
  const db = await getDatabase();
  const result = await db
    .prepare("SELECT * FROM articles WHERE id = ?")
    .bind(id)
    .first<Article>();
  return result;
}

export async function createArticle(
  title: string,
  content: string,
  author: string,
): Promise<Article> {
  const db = await getDatabase();
  const result = await db
    .prepare(
      "INSERT INTO articles (title, content, author, published) VALUES (?, ?, ?, true) RETURNING *",
    )
    .bind(title, content, author)
    .first<Article>();

  if (!result) {
    throw new Error("Failed to create article");
  }
  return result;
}

export async function updateArticle(
  id: number,
  title: string,
  content: string,
): Promise<Article> {
  const db = await getDatabase();
  const result = await db
    .prepare(
      "UPDATE articles SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *",
    )
    .bind(title, content, id)
    .first<Article>();

  if (!result) {
    throw new Error("Failed to update article");
  }
  return result;
}

export async function deleteArticle(id: number): Promise<void> {
  const db = await getDatabase();
  await db.prepare("DELETE FROM articles WHERE id = ?").bind(id).run();
}
