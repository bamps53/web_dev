import { LocalFileStorage } from '@mjackson/file-storage/local';
import { join } from 'path';
import * as fs from 'fs';

// 環境変数からストレージパスを取得、または開発用のデフォルトパスを使用
const STORAGE_PATH = process.env.FILE_STORAGE_PATH || join(process.cwd(), 'data', 'uploads');

// ストレージディレクトリが存在することを確認
if (!fs.existsSync(STORAGE_PATH)) {
  fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

export const fileStorage = new LocalFileStorage(STORAGE_PATH);
