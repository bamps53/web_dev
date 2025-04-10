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
      fileId,
    });
  } catch (error) {
    console.error("ファイルアップロードエラー:", error);
    return json<ActionData>(
      {
        success: false,
        error: "ファイルのアップロード中にエラーが発生しました",
      },
      { status: 500 }
    );
  }
};

export default function Upload() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">ファイルアップロード</h1>
      <Form method="post" encType="multipart/form-data" className="space-y-4">
        <div className="mb-4">
          <label className="block mb-2">
            ファイルを選択:
            <input
              type="file"
              name="file"
              className="block w-full mt-2 text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </label>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
        >
          アップロード
        </button>
      </Form>

      {actionData?.success && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
          ファイルが正常にアップロードされました！ (ID: {actionData.fileId})
        </div>
      )}

      {actionData?.error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          エラー: {actionData.error}
        </div>
      )}

      <div className="mt-8">
        <a href="/" className="text-blue-600 hover:text-blue-800">
          ホームに戻る
        </a>
      </div>
    </div>
  );
}
