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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">ユーザー登録</h1>
      <Form method="post" className="space-y-4">
        <div className="mb-4">
          <label className="block mb-2">
            名前:
            <input
              type="text"
              name="name"
              className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
          {actionData?.errors?.name && (
            <p className="text-red-600 text-sm mt-1">
              {actionData.errors.name}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2">
            メールアドレス:
            <input
              type="email"
              name="email"
              className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
          {actionData?.errors?.email && (
            <p className="text-red-600 text-sm mt-1">
              {actionData.errors.email}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
        >
          登録
        </button>
      </Form>

      <div className="mt-8">
        <a href="/" className="text-blue-600 hover:text-blue-800">
          ホームに戻る
        </a>
      </div>
    </div>
  );
}
