// src/app/articles/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleById } from "../../../lib/db";
import { deleteArticleAction } from "../../actions";
import { DeleteButton } from "../../../components/DeleteButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params;
  const article = await getArticleById(Number(id));

  if (!article) {
    notFound();
  }

  const deleteAction = deleteArticleAction.bind(null, article.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <article className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            {article.title}
          </h1>

          <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
            <span>著者: {article.author}</span>
            <time>
              {new Date(article.created_at).toLocaleDateString("ja-JP")}
            </time>
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            <p className="whitespace-pre-wrap text-gray-700">
              {article.content}
            </p>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Link
              href={`/articles/${article.id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              編集
            </Link>
            <form action={deleteAction}>
              <DeleteButton>削除</DeleteButton>
            </form>
            <Link
              href="/"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              一覧に戻る
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
