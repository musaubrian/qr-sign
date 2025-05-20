export default defineEventHandler(() => {
  return `
  <h1>Scan QR Code (Camera)</h1>
  <div id="reader" style="width: 300px;"></div>
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
      { fps: 10, qrbox: 250 },
      async (decodedText) => {
        html5QrCode.stop()
        status.innerText = "Scanned: " + decodedText

        const url = new URL(decodedText)
        const token = url.searchParams.get("token")
        if (!token) return status.innerText = "Invalid QR"

        const res = await fetch("/api/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, jwt })
        })

        if (!res.ok) {
          status.innerText = "Claim failed"
          return
        }

        status.innerText = "Login authorized"
      },
      (errorMsg) => {
        console.warn("QR error", errorMsg)
      }
    )
  </script>
  `;
});
