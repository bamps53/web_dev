import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "シンプルWebアプリ" },
    { name: "description", content: "シンプルかつスケーラブルなWebアプリケーションテンプレート" },
  ];
};

export default function App() {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <style>
          {`
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.5;
              max-width: 800px;
              margin: 0 auto;
              padding: 1rem;
            }
            nav {
              display: flex;
              gap: 1rem;
              margin-bottom: 2rem;
              padding-bottom: 1rem;
              border-bottom: 1px solid #eee;
            }
            footer {
              margin-top: 2rem;
              padding-top: 1rem;
              border-top: 1px solid #eee;
              text-align: center;
              font-size: 0.8rem;
              color: #666;
            }
          `}
        </style>
      </head>
      <body>
        <header>
          <nav>
            <a href="/">ホーム</a>
            <a href="/register">ユーザー登録</a>
            <a href="/upload">アップロード</a>
          </nav>
        </header>
        <main>
          <Outlet />
        </main>
        <footer>
          <p>© {new Date().getFullYear()} シンプルWebアプリ</p>
        </footer>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
