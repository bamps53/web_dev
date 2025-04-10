import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { users } from "~/utils/schema";

export const loader = async () => {
  try {
    const userList = await db.select().from(users).all();
    return json({ users: userList });
  } catch (error) {
    console.error("Error fetching users:", error);
    return json({ users: [] });
  }
};

export default function Index() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ホームページ</h1>
        <p className="text-gray-600">
          シンプルかつスケーラブルなWebアプリケーションテンプレートへようこそ！
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">ユーザー一覧</h2>
        {users.length === 0 ? (
          <p className="text-gray-600">
            ユーザーがいません。
            <a href="/register" className="text-blue-600 hover:text-blue-800">
              ユーザー登録
            </a>
            してください。
          </p>
        ) : (
          <ul className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id} className="px-4 py-3">
                <span className="font-medium">{user.name}</span>
                <span className="text-gray-500 ml-2">({user.email})</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">機能一覧</h2>
        <ul className="space-y-2">
          <li>
            <a
              href="/register"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z"></path>
              </svg>
              ユーザー登録
            </a>
          </li>
          <li>
            <a
              href="/upload"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
              ファイルアップロード
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
