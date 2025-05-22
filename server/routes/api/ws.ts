import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { renderSVG } from "uqr";
import { v7, v4, v1 } from "uuid";

type Msg =
  | { type: "init"; data: InitMsg }
  | { type: "refresh"; data: OtherMsg }
  | { type: "status"; data: OtherMsg };

type InitMsg = {
  deviceId: string | null;
  platform: string;
  language: string;
};

type OtherMsg = {
  deviceId: string;
};

const TTL = 20;

// [device_id]: {
//    userId: string
//    token: string
//    platform: string
//    language: string
//    status: "pending" | "authenticated" | "expired"
//    tokenExpiry: number
//    claimedAt: number
// }

export type DeviceSession = {
  userId: string;
  token: string;
  platform: string;
  language: string;
  status: "pending" | "authenticated" | "expired";
  createdAt: number; // stored as a unix timestamp
  tokenExpiry: number; // stored as a unix timestamp
  claimedAt: number | null;
};

export default defineWebSocketHandler({
  open(peer) {
    console.log("[ws] new peer");
  },

  message(peer, message) {
    const baseUrl = getBaseUrl(peer.request.url);
    const parsedMsg = message.json() as Msg;

    switch (parsedMsg.type) {
      case "init":
        initialMsg(parsedMsg.data, baseUrl).then((d) => peer.send(d));
        break;
      case "status":
        checkStatus(parsedMsg.data).then((d) => peer.send(d));
        break;
      case "refresh":
        refreshQr(parsedMsg.data, baseUrl).then((d) => peer.send(d));
        break;
    }
  },

  close(peer, event) {
    console.log("[ws] peer disconnected");
  },

  error(peer, error) {
    console.log("[ws] error", peer, error);
  },
});

function getSessionsLocation() {
  return join(
    process.cwd(),
    "server",
    "routes",
    "storage",
    "device_sessions.json",
  );
}

function getBaseUrl(currentUrl: string) {
  const url = new URL(currentUrl);
  const baseUrl = `${url.protocol}//${url.host}`;
  return baseUrl;
}

function genToken() {
  return `${v4()}-${v7()}-${v1()}-${v4()}`;
}

function genUrl(baseUrl: string, token: string, deviceId: string) {
  return `${baseUrl}/scan?d=${deviceId}t=${token}`;
}

async function initialMsg(data: InitMsg, baseUrl: string) {
  let deviceId = data.deviceId;
  if (!deviceId) deviceId = v7();

  const deviceSessionsPath = getSessionsLocation();
  const sessions = await readJsonFileOrInit(deviceSessionsPath);

  const deviceSessionData: DeviceSession = {
    userId: "",
    language: data.language,
    token: genToken(),
    platform: data.platform,
    status: "pending",
    createdAt: Date.now(),
    tokenExpiry: Date.now() + TTL * 1000,
    claimedAt: null,
  };

  if (deviceId === null) deviceId = v7();

  sessions[deviceId] = deviceSessionData;
  await writeFile(deviceSessionsPath, JSON.stringify(sessions, null, 2));

  const qrUrl = genUrl(baseUrl, deviceSessionData.token, data.deviceId);
  const svgQr = renderSVG(qrUrl);

  return {
    type: "qr",
    deviceId: deviceId,
    token: deviceSessionData.token,
    qr: svgQr,
    expiresAt: deviceSessionData.tokenExpiry,
  };
}

async function refreshQr(data: OtherMsg, baseUrl: string) {
  const sessionsPath = getSessionsLocation();
  const sessions = JSON.parse(await readFile(sessionsPath, "utf8"));
  const session = sessions[data.deviceId] as DeviceSession;

  session.token = genToken();
  session.tokenExpiry = Date.now() + TTL * 1000;
  session.status = "pending";
  await writeFile(sessionsPath, JSON.stringify(sessions, null, 2));

  const qrUrl = genUrl(baseUrl, session.token, data.deviceId);
  const svgQr = renderSVG(qrUrl);

  return {
    type: "qr-refresh",
    qr: svgQr,
  };
}

async function checkStatus(data: OtherMsg) {
  const deviceSessionsPath = getSessionsLocation();
  const sessions = JSON.parse(await readFile(deviceSessionsPath, "utf8"));
  const session = sessions[data.deviceId] as DeviceSession;

  if (Date.now() >= session.tokenExpiry) {
    session.status = "expired";
    await writeFile(deviceSessionsPath, JSON.stringify(sessions, null, 2));
  }

  return {
    type: "status-check",
    status: session.status,
  };
}
