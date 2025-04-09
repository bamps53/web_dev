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
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            ファイルを選択:
            <input 
              type="file" 
              name="file" 
              style={{ 
                display: "block", 
                marginTop: "0.5rem" 
              }} 
            />
          </label>
        </div>
        
        <button 
          type="submit"
          style={{
            backgroundColor: "#0066cc",
            color: "white",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          アップロード
        </button>
      </Form>
      
      {actionData?.success && (
        <div style={{ 
          color: "green", 
          marginTop: "1rem",
          padding: "1rem",
          backgroundColor: "#f0fff0",
          borderRadius: "4px"
        }}>
          ファイルが正常にアップロードされました！ (ID: {actionData.fileId})
        </div>
      )}
      
      {actionData?.error && (
        <div style={{ 
          color: "red", 
          marginTop: "1rem",
          padding: "1rem",
          backgroundColor: "#fff0f0",
          borderRadius: "4px"
        }}>
          エラー: {actionData.error}
        </div>
      )}
      
      <div style={{ marginTop: "2rem" }}>
        <a href="/">ホームに戻る</a>
      </div>
    </div>
  );
}
