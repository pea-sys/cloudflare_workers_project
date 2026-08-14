// src/components/DeleteButton.tsx
"use client";

export function DeleteButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      onClick={(e) => {
        if (!confirm("この記事を削除してもよろしいですか？")) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
