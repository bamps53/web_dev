import path from "path";
import express from "express";
import { createRequestHandler } from "@remix-run/express";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;

// Remixの静的アセットを提供
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);
app.use(express.static("public", { maxAge: "1h" }));

// ESモジュールで__dirnameを取得するための設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Remixリクエストハンドラーを設定
app.all(
  "*",
  createRequestHandler({
    build: path.join(__dirname, "build"),
    mode: process.env.NODE_ENV,
  })
);

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
