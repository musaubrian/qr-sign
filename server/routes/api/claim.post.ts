import jwt from "jsonwebtoken";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { DeviceSession } from "./ws";

export type SessionUser = {
  email: string;
  password: string;
  id: string;
  devices: {
    [key: string]: {
      platform: string;
      language: string;
    };
  };
};

type TrimmedUser = Pick<SessionUser, "email" | "id">;

export default defineEventHandler(async (event) => {
  try {
    const { token, jwt: authToken, device } = await readBody(event);
    if (!token || !authToken || !device)
      return sendError(event, createError({ statusCode: 400 }));

    const sessionsPath = join(
      process.cwd(),
      "server",
      "routes",
      "storage",
      "device_sessions.json",
    );

    const userSessionsPath = join(
      process.cwd(),
      "server",
      "routes",
      "storage",
      "users.json",
    );
    const deviceSessions = JSON.parse(await readFile(sessionsPath, "utf8"));
    const userSessions = JSON.parse(await readFile(userSessionsPath, "utf8"));

    const deviceSession = deviceSessions[device] as DeviceSession;

    if (
      !deviceSession ||
      deviceSession.status !== "pending" ||
      deviceSession.token !== token
    ) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: "Invalid or expired token",
        }),
      );
    }

    if (deviceSession.tokenExpiry && Date.now() > deviceSession.tokenExpiry) {
      delete deviceSessions[device];
      await writeFile(sessionsPath, JSON.stringify(deviceSessions, null, 2));
      return sendError(
        event,
        createError({ statusCode: 410, statusMessage: "Token expired" }),
      );
    }

    let user: TrimmedUser | null;
    try {
      user = jwt.verify(
        authToken,
        useRuntimeConfig(event).jwtSecret,
      ) as TrimmedUser;
    } catch (err) {
      return sendError(
        event,
        createError({ statusCode: 401, statusMessage: "Invalid JWT" }),
      );
    }

    deviceSession.status = "authenticated";
    deviceSession.userId = user.id;
    deviceSession.claimedAt = Date.now();

    const sessionUser = userSessions[user.email] as SessionUser;

    sessionUser.devices[device] = {
      platform: deviceSession.platform,
      language: deviceSession.language,
    };

    await writeFile(sessionsPath, JSON.stringify(deviceSessions, null, 2));
    await writeFile(userSessionsPath, JSON.stringify(userSessions, null, 2));

    return { success: true, devices: sessionUser.devices };
  } catch (e) {
    console.error(`[CLAIM ERR]: ${e}`);
    return { success: false };
  }
});
