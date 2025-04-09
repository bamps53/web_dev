# Web アプリケーション開発ガイド

このガイドでは、Volta、Remix、SQLite、Drizzle ORM、mjackson/file-storage、およびRender Persistent Diskを使用した、シンプルかつスケーラブルなWebアプリケーションの開発手順を説明します。

## 目次

1. [開発環境のセットアップ](#1-開発環境のセットアップ)
2. [プロジェクトの初期化](#2-プロジェクトの初期化)
3. [データベースの設定](#3-データベースの設定)
4. [ファイルストレージの設定](#4-ファイルストレージの設定)
5. [アプリケーション構造とルーティング](#5-アプリケーション構造とルーティング)
6. [データフェッチとフォーム処理](#6-データフェッチとフォーム処理)
7. [ファイルアップロード機能の実装](#7-ファイルアップロード機能の実装)
8. [Renderへのデプロイ](#8-renderへのデプロイ)
9. [開発のベストプラクティス](#9-開発のベストプラクティス)

## 1. 開発環境のセットアップ

### Voltaのインストールと設定

Voltaは、Node.jsやnpm/yarnなどのJavaScriptツールのバージョンを管理するためのツールです。

```bash
# macOSの場合
brew install volta

# または公式インストールスクリプトを使用
curl https://get.volta.sh | bash
```

インストール後、ターミナルを再起動するか、以下のコマンドを実行してVoltaを有効化します：

```bash
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
```

Node.jsとnpmをインストールします：

```bash
volta install node@18
volta install npm@9
```

## 2. プロジェクトの初期化

### Remixプロジェクトの作成

```bash
npx create-remix@latest --template remix-run/remix/templates/express
```

プロンプトに従ってプロジェクト名などを入力します。

### 依存関係のインストール

プロジェクトディレクトリに移動し、必要なパッケージをインストールします：

```bash
cd your-project-name

# データベース関連
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit

# ファイルストレージ関連
npm install @mjackson/form-data-parser @mjackson/file-storage
```

### プロジェクト構造の設定

以下のようなプロジェクト構造を作成します：

```
your-project/
├── app/
│   ├── routes/
│   │   ├── index.tsx
│   │   └── upload.tsx
│   └── utils/
│       ├── db.server.ts
│       └── storage.server.ts
├── drizzle/
│   └── migrations/
├── public/
├── server.js
├── drizzle.config.ts
├── .env
├── .env.example
└── render.yaml
```

## 3. データベースの設定

### データベースクライアントの設定

`app/utils/db.server.ts` ファイルを作成します：

```typescript
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { join } from 'path';

// 環境変数からデータベースパスを取得、または開発用のデフォルトパスを使用
const DATABASE_PATH = process.env.DATABASE_URL || join(process.cwd(), 'data', 'db.sqlite');

// データベースディレクトリが存在することを確認
const dbDir = DATABASE_PATH.split('/').slice(0, -1).join('/');
if (!require('fs').existsSync(dbDir)) {
  require('fs').mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(DATABASE_PATH);
export const db = drizzle(sqlite);
```

### スキーマの定義

`app/utils/schema.ts` ファイルを作成します：

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ユーザーテーブルの例
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ファイルテーブルの例
export const files = sqliteTable('files', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  path: text('path').notNull(),
  mimeType: text('mime_type'),
  size: integer('size'),
  userId: text('user_id').references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});
```

### Drizzle設定ファイル

プロジェクトルートに `drizzle.config.ts` ファイルを作成します：

```typescript
import type { Config } from 'drizzle-kit';
import { join } from 'path';

export default {
  schema: './app/utils/schema.ts',
  out: './drizzle/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || join(process.cwd(), 'data', 'db.sqlite'),
  },
} satisfies Config;
```

### マイグレーションスクリプトの設定

`package.json` ファイルの `scripts` セクションに以下を追加します：

```json
"scripts": {
  "dev": "remix dev",
  "build": "remix build",
  "start": "remix-serve build",
  "db:generate": "drizzle-kit generate:sqlite",
  "db:migrate": "node -r esbuild-register scripts/migrate.ts",
  "db:studio": "drizzle-kit studio"
}
```

マイグレーションスクリプト `scripts/migrate.ts` を作成します：

```typescript
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from '../app/utils/db.server';

// マイグレーションを実行
console.log('Running migrations...');
migrate(db, { migrationsFolder: './drizzle/migrations' });
console.log('Migrations completed');
```

## 4. ファイルストレージの設定

### ストレージクライアントの設定

`app/utils/storage.server.ts` ファイルを作成します：

```typescript
import { LocalFileStorage } from '@mjackson/file-storage/local';
import { join } from 'path';

// 環境変数からストレージパスを取得、または開発用のデフォルトパスを使用
const STORAGE_PATH = process.env.FILE_STORAGE_PATH || join(process.cwd(), 'data', 'uploads');

// ストレージディレクトリが存在することを確認
if (!require('fs').existsSync(STORAGE_PATH)) {
  require('fs').mkdirSync(STORAGE_PATH, { recursive: true });
}

export const fileStorage = new LocalFileStorage(STORAGE_PATH);
```

## 5. アプリケーション構造とルーティング

### ルートレイアウトの設定

`app/root.tsx` ファイルを編集して、アプリケーションの基本レイアウトを設定します：

```tsx
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import styles from "./styles/global.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export default function App() {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header>
          <nav>
            <a href="/">ホーム</a>
            <a href="/upload">アップロード</a>
          </nav>
        </header>
        <main>
          <Outlet />
        </main>
        <footer>
          <p>© {new Date().getFullYear()} My App</p>
        </footer>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
```

### 基本ルートの作成

`app/routes/index.tsx` ファイルを作成します：

```tsx
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { users } from "~/utils/schema";

export const loader = async () => {
  const userList = await db.select().from(users).all();
  return json({ users: userList });
};

export default function Index() {
  const { users } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>ホームページ</h1>
      <h2>ユーザー一覧</h2>
      {users.length === 0 ? (
        <p>ユーザーがいません</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 6. データフェッチとフォーム処理

### ユーザー登録フォームの作成

`app/routes/register.tsx` ファイルを作成します：

```tsx
import { ActionFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { users } from "~/utils/schema";
import { v4 as uuid } from "uuid";

type ActionData = {
  errors?: {
    name?: string;
    email?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  
  const errors: ActionData["errors"] = {};
  
  if (!name || typeof name !== "string") {
    errors.name = "名前は必須です";
  }
  
  if (!email || typeof email !== "string" || !email.includes("@")) {
    errors.email = "有効なメールアドレスを入力してください";
  }
  
  if (Object.keys(errors).length > 0) {
    return json<ActionData>({ errors }, { status: 400 });
  }
  
  await db.insert(users).values({
    id: uuid(),
    name: name as string,
    email: email as string,
  });
  
  return redirect("/");
};

export default function Register() {
  const actionData = useActionData<ActionData>();
  
  return (
    <div>
      <h1>ユーザー登録</h1>
      <Form method="post">
        <div>
          <label>
            名前:
            <input type="text" name="name" />
          </label>
          {actionData?.errors?.name && (
            <p style={{ color: "red" }}>{actionData.errors.name}</p>
          )}
        </div>
        <div>
          <label>
            メールアドレス:
            <input type="email" name="email" />
          </label>
          {actionData?.errors?.email && (
            <p style={{ color: "red" }}>{actionData.errors.email}</p>
          )}
        </div>
        <button type="submit">登録</button>
      </Form>
    </div>
  );
}
```

## 7. ファイルアップロード機能の実装

### アップロードフォームの作成

`app/routes/upload.tsx` ファイルを作成します：

```tsx
import { ActionFunction, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { parseFormData } from "@mjackson/form-data-parser";
import { fileStorage } from "~/utils/storage.server";
import { db } from "~/utils/db.server";
import { files } from "~/utils/schema";
import { v4 as uuid } from "uuid";

type ActionData = {
  success?: boolean;
  error?: string;
  fileId?: string;
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await parseFormData(request);
    const fileUpload = formData.get("file");
    
    if (!fileUpload || typeof fileUpload === "string") {
      return json<ActionData>(
        { success: false, error: "ファイルが選択されていません" },
        { status: 400 }
      );
    }
    
    const fileId = uuid();
    const fileName = fileUpload.name;
    const fileKey = `${fileId}-${fileName}`;
    
    // ファイルをストレージに保存
    await fileStorage.set(fileKey, fileUpload);
    
    // ファイル情報をデータベースに保存
    await db.insert(files).values({
      id: fileId,
      filename: fileName,
      path: fileKey,
      mimeType: fileUpload.type,
      size: fileUpload.size,
    });
    
    return json<ActionData>({ 
      success: true,
      fileId
    });
  } catch (error) {
    console.error("ファイルアップロードエラー:", error);
    return json<ActionData>(
      { success: false, error: "ファイルのアップロード中にエラーが発生しました" },
      { status: 500 }
    );
  }
};

export default function Upload() {
  const actionData = useActionData<ActionData>();
  
  return (
    <div>
      <h1>ファイルアップロード</h1>
      <Form method="post" encType="multipart/form-data">
        <div>
          <label>
            ファイルを選択:
            <input type="file" name="file" />
          </label>
        </div>
        <button type="submit">アップロード</button>
      </Form>
      
      {actionData?.success && (
        <div style={{ color: "green", marginTop: "1rem" }}>
          ファイルが正常にアップロードされました！ (ID: {actionData.fileId})
        </div>
      )}
      
      {actionData?.error && (
        <div style={{ color: "red", marginTop: "1rem" }}>
          エラー: {actionData.error}
        </div>
      )}
    </div>
  );
}
```

### ファイル表示ルートの作成

`app/routes/files/$fileId.tsx` ファイルを作成します：

```tsx
import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { files } from "~/utils/schema";
import { eq } from "drizzle-orm";

export const loader: LoaderFunction = async ({ params }) => {
  const fileId = params.fileId;
  
  if (!fileId) {
    throw new Response("ファイルIDが必要です", { status: 400 });
  }
  
  const fileData = await db.select().from(files).where(eq(files.id, fileId)).get();
  
  if (!fileData) {
    throw new Response("ファイルが見つかりません", { status: 404 });
  }
  
  return json({ file: fileData });
};

export default function FileDetails() {
  const { file } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>ファイル詳細</h1>
      <div>
        <strong>ファイル名:</strong> {file.filename}
      </div>
      <div>
        <strong>タイプ:</strong> {file.mimeType}
      </div>
      <div>
        <strong>サイズ:</strong> {Math.round(file.size / 1024)} KB
      </div>
      <div>
        <strong>アップロード日時:</strong> {new Date(file.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
```

## 8. Renderへのデプロイ

### Render設定ファイルの作成

プロジェクトルートに `render.yaml` ファイルを作成します：

```yaml
services:
  - type: web
    name: my-remix-app
    runtime: node
    buildCommand: npm ci && npm run build && npm run db:generate && npm run db:migrate
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: /var/data/db.sqlite
      - key: FILE_STORAGE_PATH
        value: /var/data/uploads
    disk:
      name: data
      mountPath: /var/data
      sizeGB: 1
```

### 環境変数の設定

`.env.example` ファイルを作成して、必要な環境変数を記述します：

```
# 開発環境用
DATABASE_URL=./data/db.sqlite
FILE_STORAGE_PATH=./data/uploads
```

実際の開発環境では、`.env.example` をコピーして `.env` ファイルを作成し、必要に応じて値を変更します。

## 9. 開発のベストプラクティス

### 開発ワークフロー

1. **環境のセットアップ**
   - Voltaを使用して、Node.jsとnpmのバージョンを固定します
   - 必要な依存関係をインストールします

2. **ローカル開発**
   - `npm run dev` でローカル開発サーバーを起動します
   - `npm run db:studio` でデータベースを視覚的に確認できます

3. **データベース変更**
   - スキーマを変更した場合は、`npm run db:generate` を実行してマイグレーションを生成します
   - `npm run db:migrate` を実行してマイグレーションを適用します

4. **デプロイ**
   - GitリポジトリをRenderに接続します
   - Renderダッシュボードで新しいWebサービスを作成し、`render.yaml` の設定を適用します
   - デプロイが完了したら、提供されたURLでアプリケーションにアクセスできます

### パフォーマンスの最適化

- Remixのネストされたルーティングを活用して、コードの分割とパフォーマンスの最適化を行います
- 大きなファイルのアップロードには、ストリーミング処理を使用します
- データベースクエリを最適化し、必要なデータのみを取得します

### セキュリティの考慮事項

- ユーザー入力は常にバリデーションを行います
- ファイルアップロードのサイズと種類を制限します
- 機密情報は環境変数で管理し、ソースコードにハードコーディングしないようにします

### スケーリングの考慮事項

- SQLiteは小規模なアプリケーションやPoCに適していますが、大規模なアプリケーションでは、PostgreSQLなどのより堅牢なデータベースへの移行を検討します
- ファイルストレージは、アプリケーションの成長に合わせて、S3やCloudflare R2などのクラウドストレージに移行することを検討します
- Renderの設定で、必要に応じてディスクサイズを増やすことができます（$0.25/GB/月）

## まとめ

このガイドでは、Volta、Remix、SQLite、Drizzle ORM、mjackson/file-storage、およびRender Persistent Diskを使用した、シンプルかつスケーラブルなWebアプリケーションの開発手順を説明しました。これらの技術を組み合わせることで、開発の一貫性、データの永続性、効率的なルーティング、型安全なデータベース操作、そして安定したファイルアップロード機能を備えたアプリケーションを構築できます。

このテンプレートは、概念実証（PoC）から始めて、必要に応じて拡張できるように設計されています。Renderの自動バックアップ機能により、データの保全も確保されています。
