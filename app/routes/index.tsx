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
    <div>
      <h1>ホームページ</h1>
      <p>シンプルかつスケーラブルなWebアプリケーションテンプレートへようこそ！</p>
      
      <h2>ユーザー一覧</h2>
      {users.length === 0 ? (
        <p>ユーザーがいません。<a href="/register">ユーザー登録</a>してください。</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      )}
      
      <div style={{ marginTop: "2rem" }}>
        <h2>機能一覧</h2>
        <ul>
          <li><a href="/register">ユーザー登録</a></li>
          <li><a href="/upload">ファイルアップロード</a></li>
        </ul>
      </div>
    </div>
  );
}
