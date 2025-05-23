export default defineEventHandler(() => {
  return `
<!DOCTYPE html>
  <head>
<link rel="stylesheet" href="https://fonts.xz.style/serve/inter.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css">
    <style>
      body {
        width: 100svw;
        height: 100svh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
    </style>
  </head>
  <h1>Scan QR Code (Camera)</h1>
  <div id="reader" style="width: 50%; height: 50%"></div>
  <p id="status">Waiting for scan...</p>

  <script src="https://unpkg.com/html5-qrcode"></script>
  <script>
    const jwt = localStorage.getItem('jwt')
    if (!jwt) {
      alert("You must login first to scan.")
      location.href = '/auth/login'
    }

    const status = document.getElementById("status")
    const html5QrCode = new Html5Qrcode("reader")

    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 300 },
      async (decodedText) => {
        html5QrCode.stop()

        const url = new URL(decodedText)
        const token = url.searchParams.get("t")
        const device = url.searchParams.get("d")
        if (!token || !device) return status.innerText = "Invalid QR"

        const res = await fetch("/api/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, jwt, device })
        })

        if (!res.ok) {
          status.innerText = "Claim failed"
          return
        }
        const data = await res.json()
        console.log(data.success, data.devices);
        localStorage.setItem("devices", JSON.stringify(data.devices))

        status.innerText = "Login authorized"
        location.href = '/'
      },
      (errorMsg) => {
        console.warn("QR error", errorMsg)
      }
    )
  </script>
  `;
});
