import { serve } from "@hono/node-server";
import { Hono } from "hono";

const products = [
  { id: 1, name: "スマートフォン", price: 80000, category: "electronics" },
  { id: 2, name: "ノートパソコン", price: 120000, category: "electronics" },
  { id: 3, name: "コーヒーメーカー", price: 15000, category: "kitchen" },
  { id: 4, name: "掃除機", price: 35000, category: "home" },
  { id: 5, name: "スニーカー", price: 8000, category: "fashion" },
];

const app = new Hono();

app.get("/", (c) => {
  return c.json({
    message: "Welcome to Products API",
    endpoints: {
      getAllProducts: "/api/products",
      getProductById: "/api/products/:id",
      getProductsByCategory: "/api/products/category/:category",
    },
  });
});

app.get("/api/products", (c) => {
  return c.json({ products });
});

app.get("/api/products/:id", (c) => {
  const id = Number(c.req.param("id"));
  const product = products.find((p) => p.id === id);

  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }
  return c.json({ product });
});

app.get("/api/products/category/:category", (c) => {
  const category = c.req.param("category");
  const filteredProducts = products.filter((p) => p.category === category);

  if (filteredProducts.length === 0) {
    return c.json({ error: "No products found in this category" }, 404);
  }
  return c.json({ products: filteredProducts });
});

const port = process.env.PORT || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
});
