import { SessionUser } from "../claim.post";
import { readFile } from "fs/promises";
import { join } from "path";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const userSessionsPath = join(
    process.cwd(),
    "server",
    "routes",
    "storage",
    "users.json",
  );

  const userSessions = JSON.parse(await readFile(userSessionsPath, "utf8"));
  const userSession = userSessions.find((u) => u.id === id) as SessionUser;

  return { devices: userSession.devices };
});
