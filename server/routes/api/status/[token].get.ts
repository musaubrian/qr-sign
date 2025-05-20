import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export default defineEventHandler(async (e) => {
  const token = getRouterParam(e, "token");
  const previous = getQuery(e).previous
    ? getQuery(e).previous.toString()
    : null;

  const sessionsPath = join(
    process.cwd(),
    "server",
    "routes",
    "storage",
    "sessions.json",
  );
  const sessions = JSON.parse(await readFile(sessionsPath, "utf8"));

  if (previous && sessions[previous]) {
    delete sessions[previous];
    await writeFile(sessionsPath, JSON.stringify(sessions, null, 2));
  }

  const session = sessions[token];

  if (!session) {
    return sendError(
      e,
      createError({ statusCode: 404, statusMessage: "Token not found" }),
    );
  }

  if (session.expiresAt && Date.now() > session.expiresAt) {
    delete sessions[token];
    await writeFile(sessionsPath, JSON.stringify(sessions, null, 2));
    return sendError(
      e,
      createError({ statusCode: 410, statusMessage: "Token expired" }),
    );
  }

  if (session.status === "authenticated") {
    return {
      status: "authenticated",
      user: session.user,
      jwt: session.jwt,
    };
  }

  return { status: "pending" };
});
