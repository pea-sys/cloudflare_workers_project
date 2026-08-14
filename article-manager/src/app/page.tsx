// src/app/page.tsx
import Link from "next/link";
import { getAllArticles } from "../lib/db";

export default async function HomePage() {
  const articles = await getAllArticles();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900">記事一覧</h1>
          <Link
            href="/articles/new"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700"
          >
            新規作成
          </Link>
        </div>

        {articles.length === 0 ? (
          <p className="text-gray-500 text-center py-12">記事がありません</p>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md"
              >
                <h2 className="text-xl font-semibold mb-2">
                  <Link
                    href={`/articles/${article.id}`}
                    className="text-slate-900 hover:text-blue-600"
                  >
                    {article.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {article.content}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{article.author}</span>
                  <time>
                    {new Date(article.created_at).toLocaleDateString("ja-JP")}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
