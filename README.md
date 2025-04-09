# シンプルかつスケーラブルなWebアプリケーションテンプレート

このリポジトリは、シンプルでありながらスケーラブルなWebアプリケーションを開発するためのテンプレートです。Volta、Remix、SQLite、Drizzle ORM、mjackson/file-storage、およびRender Persistent Diskを組み合わせて、効率的な開発環境と堅牢なデプロイ構成を提供します。

## 特徴

- **Volta**: Node.jsとnpmのバージョン管理による開発環境の一貫性
- **Remix**: React Routerを内包した高性能なフルスタックフレームワーク
- **SQLite + Drizzle ORM**: 軽量なデータベースと型安全なORMによるデータ管理
- **mjackson/file-storage**: シンプルで効率的なファイルアップロード処理
- **Render Persistent Disk**: 低コストで信頼性の高いデータ永続化とバックアップ

## 前提条件

- [Node.js](https://nodejs.org/) (推奨: Voltaを使用してバージョン管理)
- [Volta](https://volta.sh/) (JavaScript開発環境の管理)
- [Git](https://git-scm.com/)

## Voltaのインストール

このプロジェクトでは、開発環境間でNode.jsとnpmのバージョンを一貫させるために[Volta](https://volta.sh/)を使用しています。

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

インストールを確認するには、以下を実行します：

```bash
volta --version
```

## クイックスタート

### 1. Node.jsとnpmのインストール

```bash
volta install node@18
volta install npm@9
```

### 2. プロジェクトのクローンと依存関係のインストール

```bash
git clone <repository-url>
cd simple_web_dev
npm install
```

### 3. 環境変数の設定

`.env.example`ファイルをコピーして`.env`ファイルを作成します：

```bash
cp .env.example .env
```

必要に応じて`.env`ファイルの値を編集します。

### 4. データベースのセットアップ

```bash
npm run db:generate
npm run db:migrate
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認します。

## プロジェクト構造

```
simple_web_dev/
├── app/                  # Remixアプリケーションコード
│   ├── routes/           # ルート定義
│   └── utils/            # ユーティリティ関数とサーバーサイドコード
├── drizzle/              # Drizzle ORM関連ファイル
│   └── migrations/       # データベースマイグレーション
├── public/               # 静的ファイル
├── scripts/              # スクリプト
├── server.js             # サーバー設定
├── drizzle.config.ts     # Drizzle ORM設定
├── .env                  # 環境変数（gitignoreに含める）
├── .env.example          # 環境変数のサンプル
└── render.yaml           # Renderデプロイ設定
```

## 主要コマンド

- **開発サーバーの起動**: `npm run dev`
- **本番用ビルド**: `npm run build`
- **本番サーバーの起動**: `npm start`
- **データベースマイグレーション生成**: `npm run db:generate`
- **データベースマイグレーション適用**: `npm run db:migrate`
- **データベース管理ツール起動**: `npm run db:studio`

## Renderへのデプロイ

1. GitリポジトリをRenderに接続します
2. 「Blueprint」からデプロイを選択し、`render.yaml`ファイルを使用します
3. 必要に応じて環境変数を設定します
4. デプロイが完了したら、提供されたURLでアプリケーションにアクセスできます

## 詳細な開発ガイド

詳細な開発手順については、[DEVELOPMENT.md](DEVELOPMENT.md)を参照してください。

## 技術スタックの詳細

| コンポーネント | 役割 | 設定例 |
|--------------|------|-------|
| Volta | JavaScriptツールのバージョン管理 | `volta install node@18` |
| Remix（React Router） | ウェブフレームワークとルーティング | `npx create-remix@latest` |
| Drizzle ORM + SQLite | データベース操作と永続化 | `/var/data/db.sqlite`に保存 |
| mjackson/file-storage | ファイルアップロードの管理 | `/var/data/uploads`に保存 |
| Render Persistent Disk | データの永続化とバックアップ | 7日間スナップショット自動提供 |

## コスト効率

Renderの Persistent Disk を使用することで、低コストでデータの永続性を確保できます：

| ディスクサイズ(GB) | 月額費用($) | 注記 |
|------------------|------------|------|
| 1 | 0.25 | 非常に小規模なPoCに最適な最小サイズ |
| 10 | 2.50 | 中程度のデータストレージ要件を持つPoCに適しています |
| 50 | 12.50 | より多くのデータまたはファイルアップロードのニーズを持つPoCに十分です |

## ライセンス

[MIT](LICENSE)

## 参考リソース

- [Volta - The Hassle-Free JavaScript Tool Manager](https://volta.sh/)
- [Remix Documentation](https://remix.run/docs/en/main)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [mjackson/file-storage GitHub Repository](https://github.com/mjackson/file-storage)
- [Render Documentation](https://render.com/docs)
