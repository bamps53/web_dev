import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import styles from "~/styles/tailwind.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const meta: MetaFunction = () => {
  return [
    { title: "シンプルWebアプリ" },
    {
      name: "description",
      content: "シンプルかつスケーラブルなWebアプリケーションテンプレート",
    },
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
      </head>
      <body className="font-sans leading-normal max-w-3xl mx-auto p-4">
        <header>
          <nav className="flex gap-4 mb-8 pb-4 border-b border-gray-200">
            <a href="/" className="text-blue-600 hover:text-blue-800">
              ホーム
            </a>
            <a href="/register" className="text-blue-600 hover:text-blue-800">
              ユーザー登録
            </a>
            <a href="/upload" className="text-blue-600 hover:text-blue-800">
              アップロード
            </a>
          </nav>
        </header>
        <main>
          <Outlet />
        </main>
        <footer className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} シンプルWebアプリ</p>
        </footer>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
