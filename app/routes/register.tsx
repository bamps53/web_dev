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
  
  try {
    await db.insert(users).values({
      id: uuid(),
      name: name as string,
      email: email as string,
    });
    
    return redirect("/");
  } catch (error) {
    console.error("Error creating user:", error);
    return json<ActionData>(
      { errors: { name: "ユーザー登録中にエラーが発生しました" } },
      { status: 500 }
    );
  }
};

export default function Register() {
  const actionData = useActionData<ActionData>();
  
  return (
    <div>
      <h1>ユーザー登録</h1>
      <Form method="post">
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            名前:
            <input 
              type="text" 
              name="name" 
              style={{ 
                display: "block", 
                width: "100%", 
                padding: "0.5rem",
                marginTop: "0.25rem" 
              }} 
            />
          </label>
          {actionData?.errors?.name && (
            <p style={{ color: "red", margin: "0.25rem 0" }}>{actionData.errors.name}</p>
          )}
        </div>
        
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            メールアドレス:
            <input 
              type="email" 
              name="email" 
              style={{ 
                display: "block", 
                width: "100%", 
                padding: "0.5rem",
                marginTop: "0.25rem" 
              }} 
            />
          </label>
          {actionData?.errors?.email && (
            <p style={{ color: "red", margin: "0.25rem 0" }}>{actionData.errors.email}</p>
          )}
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
          登録
        </button>
      </Form>
      
      <div style={{ marginTop: "2rem" }}>
        <a href="/">ホームに戻る</a>
      </div>
    </div>
  );
}
