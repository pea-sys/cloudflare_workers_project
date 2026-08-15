// src/index.ts
export { ChatRoom } from "./chat-room";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // WebSocketエンドポイント
    if (url.pathname === "/ws") {
      // Durable ObjectのIDを生成（ここでは固定のIDを使用）
      const id = env.CHAT_ROOM.idFromName("default-room");
      const stub = env.CHAT_ROOM.get(id);

      // Durable Objectにリクエストを転送
      return stub.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
