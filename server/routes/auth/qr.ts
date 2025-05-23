export default defineEventHandler(async () => {
  return `
<!DOCTYPE html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css">
    <style>
      svg {
        width: 50svw;
        height: 50svh;
      }

      body {
        height: 100svh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 0;
      }
    </style>
  </head>
<body>
  <h1>Login with QR Code</h1>
  <div id="qr">Loading...</div>
  <a style="font-size: 1.5rem" href="/auth/login"><- Go back</a>


<script>
let data = {
  tokenExpiry: 10000,
};

const baseUrl = new URL(window.location.href);
const wsPath = "api/ws";
const wsProtocol = baseUrl.protocol === "https:" ? "wss://" : "ws://";
const wsUrl = wsProtocol + baseUrl.host + "/" + wsPath;
const socket = new WebSocket(wsUrl);

socket.addEventListener("open", function (event) {
  console.log("[ws] connected");

  socket.send(
    JSON.stringify({
      type: "init",
      data: {
        deviceId: localStorage.getItem("deviceId"),
        platform: navigator.platform,
        language: navigator.language,
      },
    }),
  );
});

socket.addEventListener("message", function (event) {
  data = JSON.parse(event.data);
  if (data.type === "qr") {
    document.getElementById("qr").innerHTML = data.qr;
    localStorage.setItem("deviceId", data.deviceId);
  }

  if (data.type === "qr-refresh") {
    document.getElementById("qr").innerHTML = data.qr;
  }

  if (data.type === "status-check") {
    if (data.status === "expired") {
      socket.send(
        JSON.stringify({
          type: "refresh",
          data: { deviceId: localStorage.getItem("deviceId") },
        }),
      );
    }
    if (data.status === "authenticated") {
      localStorage.setItem('token', data.token)
      alert("Authentication successful")
      location.href = '/'
    }
  }
});

socket.addEventListener("error", function (event) {
  console.error("WebSocket error:", event);
  alert("[ws] An error occured, check logs for more info")
});

socket.addEventListener("close", function (event) {
  console.log("[ws] connection closed");
});

interval = setInterval(
  () =>
    socket.send(
      JSON.stringify({
        type: "status",
        data: { deviceId: localStorage.getItem("deviceId") },
      }),
    ),
  5000,
);

setTimeout(
  () => {
    clearInterval(interval);
    socket.send(
      JSON.stringify({
        type: "refresh",
        data: { deviceId: localStorage.getItem("deviceId") },
      }),
    );
  },
  data.tokenExpiry - Date.now() - 10000,
);
</script>
</body>
  `;
});
