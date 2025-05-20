import { readFile } from "fs/promises";
import { join } from "path";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);
  if (!email || !password)
    return sendError(event, createError({ statusCode: 400 }));

  const users = JSON.parse(
    await readFile(
      join(process.cwd(), "server", "routes", "storage", "users.json"),
      "utf-8",
    ),
  );
  const user = users[email];

  if (!user || user.password !== password) {
    return sendError(
      event,
      createError({ statusCode: 401, statusMessage: "Invalid credentials" }),
    );
  }

  const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET!, {
    expiresIn: "10m",
  });
  return { user: JSON.stringify({ email: user.email, id: user.id }), token };
});
