// src/app/actions.ts
"use server";

import { createArticle, updateArticle, deleteArticle } from "../lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createArticleAction(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const author = formData.get("author") as string;

  if (!title || !content || !author) {
    throw new Error("全てのフィールドを入力してください");
  }

  await createArticle(title, content, author);
  revalidatePath("/");
  redirect("/");
}

export async function updateArticleAction(id: number, formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content) {
    throw new Error("全てのフィールドを入力してください");
  }

  await updateArticle(id, title, content);
  revalidatePath(`/articles/${id}`);
  redirect(`/articles/${id}`);
}

export async function deleteArticleAction(id: number) {
  await deleteArticle(id);
  revalidatePath("/");
  redirect("/");
}
