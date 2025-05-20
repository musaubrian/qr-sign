import { v4 as uuid } from "uuid";
import { renderSVG } from "uqr";
import { writeFile } from "fs/promises";
import { join } from "path";
import { readJsonFileOrInit } from "~/utils/json";

export default defineEventHandler(async (e) => {
  const token = uuid();
  const previousToken = getQuery(e).previous
    ? getQuery(e).previous.toString()
    : null;
  const now = Date.now();
  const expiresAt = now + 30 * 1000; // 30 seconds
  const host = e.node.req.headers.host;
  const protocol = e.node.req.headers["x-forwarded-proto"] || "http";
  const baseUrl = `${protocol}://${host}`;

  const file = join(
    process.cwd(),
    "server",
    "routes",
    "storage",
    "sessions.json",
  );
  const sessions = await readJsonFileOrInit(file);
  if (previousToken && sessions[previousToken]) {
    delete sessions[previousToken];
    await writeFile(file, JSON.stringify(sessions, null, 2));
  }

  sessions[token] = {
    status: "pending",
    createdAt: now,
    expiresAt,
  };

  await writeFile(file, JSON.stringify(sessions, null, 2));

  const qrUrl = `${baseUrl}/api/claim?token=${token}`;
  const svgQr = renderSVG(qrUrl);

  return { token, qr: svgQr, expiresAt };
});
