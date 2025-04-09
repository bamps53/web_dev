import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { join } from 'path';
import * as fs from 'fs';

// 環境変数からデータベースパスを取得、または開発用のデフォルトパスを使用
const DATABASE_PATH = process.env.DATABASE_URL || join(process.cwd(), 'data', 'db.sqlite');

// データベースディレクトリが存在することを確認
const dbDir = DATABASE_PATH.split('/').slice(0, -1).join('/');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(DATABASE_PATH);
export const db = drizzle(sqlite);
