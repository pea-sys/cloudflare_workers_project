import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";

function getLocalD1DB() {
  try {
    const basepath = path.resolve(".wrangler");
    const dbFile = fs
      .readdirSync(basepath, { encoding: "utf-8", recursive: true })
      .find((f) => f.endsWith(".sqlite"));
    return url;
  } catch (err) {
    console.log(`Error ${err.message}`);
  }
}

export default defineConfig({
    out: "./drizzle",
    schema: "./src/"
}
