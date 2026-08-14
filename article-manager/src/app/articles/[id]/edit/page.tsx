// src/app/articles/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { getArticleById } from "../../../../lib/db";
import { updateArticleAction } from "../../../actions";
import { ArticleForm } from "../../../../components/ArticleForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const article = await getArticleById(Number(id));

  if (!article) {
    notFound();
  }

  const updateAction = updateArticleAction.bind(null, article.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">記事を編集</h1>

        <ArticleForm
          action={updateAction}
          defaultValues={{
            title: article.title,
            content: article.content,
          }}
          submitLabel="更新"
          cancelHref={`/articles/${article.id}`}
          showAuthorField={false}
        />
      </div>
    </div>
  );
}
