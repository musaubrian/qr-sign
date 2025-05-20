import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token");
  const sessions = JSON.parse(
    await readFile(
      join(process.cwd(), "server", "routes", "storage", "sessions.json"),
      "utf8",
    ),
  );

  if (!sessions[token]) {
    return sendError(
      event,
      createError({ statusCode: 404, statusMessage: "Token not found" }),
    );
  }

  const session = sessions[token];

  if (!session) {
    return sendError(
      event,
      createError({ statusCode: 404, statusMessage: "Token not found" }),
    );
  }

  if (session.expiresAt && Date.now() > session.expiresAt) {
    delete sessions[token];
    await writeFile(
      join(process.cwd(), "storage/sessions.json"),
      JSON.stringify(sessions, null, 2),
    );
    return sendError(
      event,
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
