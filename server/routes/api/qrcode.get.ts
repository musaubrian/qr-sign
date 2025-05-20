import { v4 as uuid } from "uuid";
import { renderSVG } from "uqr";
import { writeFile } from "fs/promises";
import { join } from "path";
import { readJsonFileOrInit } from "~/utils/json";

export default defineEventHandler(async () => {
  const token = uuid();
  const now = Date.now();
  const expiresAt = now + 30 * 1000; // 30 seconds

  const file = join(
    process.cwd(),
    "server",
    "routes",
    "storage",
    "sessions.json",
  );
  const sessions = await readJsonFileOrInit(file);

  sessions[token] = {
    status: "pending",
    createdAt: now,
    expiresAt,
  };

  await writeFile(file, JSON.stringify(sessions, null, 2));

  const qrUrl = `http://localhost:3000/api/claim?token=${token}`;
  const svgQr = renderSVG(qrUrl);

  return { token, qr: svgQr, expiresAt };
});
