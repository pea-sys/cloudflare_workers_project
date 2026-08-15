// public/app.js
let ws;
const messages = document.getElementById("messages");
const status = document.getElementById("status");
const messageInput = document.getElementById("messageInput");

function connect() {
  const name = document.getElementById("nameInput").value.trim() || "匿名";

  const protocol = location.protocol === "https:" ? "wss" : "ws";
  ws = new WebSocket(
    `${protocol}://${location.host}/ws?name=${encodeURIComponent(name)}`,
  );

  ws.onopen = () => {
    document.getElementById("login").style.display = "none";
    document.getElementById("chat").style.display = "block";
    status.textContent = `${name}として接続中`;
    status.style.color = "green";
    messageInput.focus();
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // 履歴メッセージの場合
    if (data.type === "history") {
      data.messages.forEach((msg) => {
        const div = document.createElement("div");
        div.className = "message user";
        const time = new Date(msg.timestamp).toLocaleTimeString("ja-JP");
        div.innerHTML = `<span class="name">${msg.name}:</span>${msg.text}<span class="time">${time}</span>`;
        messages.appendChild(div);
      });
      messages.scrollTop = messages.scrollHeight;
      return;
    }

    // 通常のメッセージ処理（既存のコード）
    const div = document.createElement("div");
    div.className = `message ${data.type}`;

    if (data.type === "system") {
      div.textContent = data.message;
      if (data.count !== undefined) {
        div.textContent += ` (接続数: ${data.count})`;
      }
    } else {
      const time = new Date(data.timestamp).toLocaleTimeString("ja-JP");
      div.innerHTML = `<span class="name">${data.name}:</span>${data.text}<span class="time">${time}</span>`;
    }

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  };

  ws.onclose = () => {
    status.textContent = "接続が切断されました";
    status.style.color = "red";
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
}

function sendMessage() {
  const message = messageInput.value.trim();
  if (message && ws && ws.readyState === WebSocket.OPEN) {
    ws.send(message);
    messageInput.value = "";
  }
}

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
