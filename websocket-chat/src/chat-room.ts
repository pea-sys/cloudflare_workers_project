// src/chat-room.ts
interface ChatMessage {
  type: "message";
  name: string;
  text: string;
  timestamp: string;
}

export class ChatRoom {
  private sessions: Map<WebSocket, { name: string }>;
  private messageHistory: ChatMessage[] = [];
  private readonly MAX_HISTORY = 100;

  constructor(
    private state: DurableObjectState,
    private env: Env,
  ) {
    this.sessions = new Map();
    this.state.blockConcurrencyWhile(async () => {
      const stored =
        await this.state.storage.get<ChatMessage[]>("messageHistory");
      if (stored) {
        this.messageHistory = stored;
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader || upgradeHeader !== "websocket") {
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }

    const url = new URL(request.url);
    const name = url.searchParams.get("name") || "匿名";

    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];

    // Hibernation対応のためにタグを設定してaccept
    this.state.acceptWebSocket(server, [name]);

    // セッションに追加（タグからユーザー名を取得できる）
    this.sessions.set(server, { name });

    // 新規接続時に過去の履歴を送信
    if (this.messageHistory.length > 0) {
      server.send(
        JSON.stringify({
          type: "history",
          messages: this.messageHistory,
        }),
      );
    }

    // 接続通知をブロードキャスト
    this.broadcast(
      {
        type: "system",
        message: `${name}さんが参加しました`,
        count: this.sessions.size,
      },
      server,
    );

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  // Hibernation API: メッセージ受信時
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    // タグからユーザー名を取得
    const tags = this.state.getTags(ws);
    const name = tags[0] || "匿名";

    const chatMessage: ChatMessage = {
      type: "message",
      name,
      text:
        typeof message === "string"
          ? message
          : new TextDecoder().decode(message),
      timestamp: new Date().toISOString(),
    };

    // メッセージ履歴に追加
    this.messageHistory.push(chatMessage);

    if (this.messageHistory.length > this.MAX_HISTORY) {
      this.messageHistory.shift();
    }

    // Storageに保存
    await this.state.storage.put("messageHistory", this.messageHistory);

    // ブロードキャスト
    this.broadcast(chatMessage);
  }

  // Hibernation API: WebSocket切断時
  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean,
  ) {
    // タグからユーザー名を取得
    const tags = this.state.getTags(ws);
    const name = tags[0] || "匿名";

    // セッションから削除
    this.sessions.delete(ws);

    // 切断通知をブロードキャスト
    this.broadcast({
      type: "system",
      message: `${name}さんが退出しました`,
      count: this.sessions.size,
    });
  }

  // Hibernation API: WebSocketエラー時
  async webSocketError(ws: WebSocket, error: unknown) {
    console.error("WebSocket error:", error);
    // エラー時もセッションから削除
    this.sessions.delete(ws);
  }

  private broadcast(message: unknown, exclude?: WebSocket) {
    const data = JSON.stringify(message);

    // Hibernation対応では、getWebSocketsを使って接続中のWebSocketを取得
    const sockets = this.state.getWebSockets();

    for (const ws of sockets) {
      if (
        (ws !== exclude && ws.readyState === WebSocket.OPEN) ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        try {
          ws.send(data);
        } catch (error) {
          console.error("Failed to send message:", error);
        }
      }
    }
  }
}
