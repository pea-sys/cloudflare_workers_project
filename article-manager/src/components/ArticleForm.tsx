// src/components/ArticleForm.tsx
import Link from "next/link";

interface ArticleFormProps {
  action: (formData: FormData) => void;
  defaultValues?: {
    title?: string;
    content?: string;
    author?: string;
  };
  submitLabel: string;
  cancelHref: string;
  showAuthorField?: boolean;
}

export function ArticleForm({
  action,
  defaultValues,
  submitLabel,
  cancelHref,
  showAuthorField = false,
}: ArticleFormProps) {
  return (
    <form
      action={action}
      className="bg-white rounded-xl p-6 shadow-sm space-y-6"
    >
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          タイトル
        </label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={defaultValues?.title}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {showAuthorField && (
        <div>
          <label
            htmlFor="author"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            著者名
          </label>
          <input
            type="text"
            id="author"
            name="author"
            defaultValue={defaultValues?.author}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          本文
        </label>
        <textarea
          id="content"
          name="content"
          defaultValue={defaultValues?.content}
          rows={10}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          {submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
