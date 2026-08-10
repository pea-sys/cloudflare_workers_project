import { serve } from "@hono/node-server";
import { Hono } from "hono";

const users = [
  { id: 1, name: "山田太郎", email: "taro@example.com", role: "admin" },
  { id: 2, name: "佐藤花子", email: "hanako@example.com", role: "user" },
  { id: 3, name: "鈴木一郎", email: "ichiro@example.com", role: "user" },
  { id: 4, name: "田中次郎", email: "jiro@example.com", role: "manager" },
  { id: 5, name: "伊藤三郎", email: "saburo@example.com", role: "user" },
];

const app = new Hono();

app.get("/", (c) => {
  return c.json({
    message: "Welcome to Users API",
    endpoints: {
      getAllUsers: "/api/users",
      getUserById: "/api/users/:id",
      getUsersByRole: "/api/users/role/:role",
    },
  });
});

app.get("/api/users", (c) => {
  const safeUsers = users.map(({ email, ...rest }) => rest);
  return c.json({ users: safeUsers });
});

app.get("/api/users/:id", (c) => {
  const id = Number(c.req.param("id"));
  const user = users.find((u) => u.id === id);
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }
  return c.json({ user });
});

app.get("/api/users/role/:role", (c) => {
  const role = c.req.param("role");
  const filteredUsers = users.filter((u) => u.role === role);

  if (filteredUsers.length === 0) {
    return c.json({ error: "No users found with this role" }, 404);
  }

  const safeUsers = filteredUsers.map(({ email, ...rest }) => rest);
  return c.json({ users: safeUsers });
});

const port = process.env.PORT || 3001;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
});
