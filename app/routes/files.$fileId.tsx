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
    const fileData = await db
      .select()
      .from(files)
      .where(eq(files.id, fileId))
      .get();

    if (!fileData) {
      throw new Response("ファイルが見つかりません", { status: 404 });
    }

    return json({ file: fileData });
  } catch (error) {
    console.error("Error fetching file:", error);
    throw new Response("ファイルの取得中にエラーが発生しました", {
      status: 500,
    });
  }
};

export default function FileDetails() {
  const { file } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">ファイル詳細</h1>
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 gap-3">
          <div className="border-b border-gray-200 pb-2">
            <span className="font-semibold">ファイル名:</span> {file.filename}
          </div>
          <div className="border-b border-gray-200 pb-2">
            <span className="font-semibold">タイプ:</span>{" "}
            {file.mimeType || "不明"}
          </div>
          <div className="border-b border-gray-200 pb-2">
            <span className="font-semibold">サイズ:</span>{" "}
            {Math.round((file.size || 0) / 1024)} KB
          </div>
          <div>
            <span className="font-semibold">アップロード日時:</span>{" "}
            {new Date(file.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div>
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
            別のファイルをアップロード
          </a>
        </div>
        <div>
          <a
            href="/"
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
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
            ホームに戻る
          </a>
        </div>
      </div>
    </div>
  );
}
