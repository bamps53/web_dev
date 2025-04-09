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
  
  try {
    const fileData = await db.select().from(files).where(eq(files.id, fileId)).get();
    
    if (!fileData) {
      throw new Response("ファイルが見つかりません", { status: 404 });
    }
    
    return json({ file: fileData });
  } catch (error) {
    console.error("Error fetching file:", error);
    throw new Response("ファイルの取得中にエラーが発生しました", { status: 500 });
  }
};

export default function FileDetails() {
  const { file } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>ファイル詳細</h1>
      <div style={{ 
        padding: "1rem", 
        backgroundColor: "#f5f5f5", 
        borderRadius: "4px",
        marginBottom: "1rem"
      }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <strong>ファイル名:</strong> {file.filename}
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <strong>タイプ:</strong> {file.mimeType || "不明"}
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <strong>サイズ:</strong> {Math.round((file.size || 0) / 1024)} KB
        </div>
        <div>
          <strong>アップロード日時:</strong> {new Date(file.createdAt).toLocaleString()}
        </div>
      </div>
      
      <div>
        <a href="/upload">別のファイルをアップロード</a>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <a href="/">ホームに戻る</a>
      </div>
    </div>
  );
}
