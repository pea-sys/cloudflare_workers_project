// src/app/articles/new/page.tsx
import { createArticleAction } from "../../actions";
import { ArticleForm } from "../../../components/ArticleForm";

export default function NewArticlePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">記事を作成</h1>

        <ArticleForm
          action={createArticleAction}
          submitLabel="作成"
          cancelHref="/"
          showAuthorField={true}
        />
      </div>
    </div>
  );
}
