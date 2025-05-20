import jwt from "jsonwebtoken";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export default defineEventHandler(async (event) => {
  const { token, jwt: authToken, deviceInfo } = await readBody(event);
  if (!token || !authToken)
    return sendError(event, createError({ statusCode: 400 }));

  const sessionsPath = join(
    process.cwd(),
    "server",
    "routes",
    "storage",
    "sessions.json",
  );
  const sessions = JSON.parse(await readFile(sessionsPath, "utf8"));

  const session = sessions[token];

  if (!session || session.status !== "pending") {
    return sendError(
      event,
      createError({ statusCode: 404, statusMessage: "Invalid or used token" }),
    );
  }

  if (session.expiresAt && Date.now() > session.expiresAt) {
    delete sessions[token];
    await writeFile(sessionsPath, JSON.stringify(sessions, null, 2));
    return sendError(
      event,
      createError({ statusCode: 410, statusMessage: "Token expired" }),
    );
  }

  if (!sessions[token] || sessions[token].status !== "pending") {
    return sendError(
      event,
      createError({ statusCode: 404, statusMessage: "Invalid or used token" }),
    );
  }

  let user;
  try {
    user = jwt.verify(authToken, process.env.JWT_SECRET!);
  } catch (err) {
    return sendError(
      event,
      createError({ statusCode: 401, statusMessage: "Invalid JWT" }),
    );
  }

  sessions[token] = {
    status: "authenticated",
    user: {
      id: user.id,
      email: user.email,
    },
    jwt: authToken,
    claimedAt: Date.now(),
    deviceInfo: deviceInfo || null,
  };

  await writeFile(sessionsPath, JSON.stringify(sessions, null, 2));
  return { success: true };
});
