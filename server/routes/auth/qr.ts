export default defineEventHandler(async () => {
  return `
  <head>
    <link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css">
    <style>
      svg {
        width: 50svw;
        height: 50svh
      }

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
<body>
  <h1>Login with QR Code</h1>
  <div id="qr">Loading...</div>
  <a style="font-size: 2.5rem;" href="/auth/login">Go back</a>


  <script>
    let token
    let interval

    async function fetchQR() {
      const res = await fetch('/api/qrcode')
      const data = await res.json()

      token = data.token
      document.getElementById('qr').innerHTML = data.qr

      interval = setInterval(() => checkStatus(), 2000)
      setTimeout(() => {
        clearInterval(interval)
        fetchQR()
      }, data.expiresAt - Date.now() - 10000)
    }

  async function checkStatus() {
    const res = await fetch('/api/status/' + token);
    if (res.status === 410) return fetchQR();
    if (!res.ok) return;

    const data = await res.json();

    if (data.status === "authenticated") {
      clearInterval(interval);
      localStorage.setItem('jwt', data.jwt);
      localStorage.setItem('user', JSON.stringify(data.user));
      location.href = '/';
    }
  }

    fetchQR()
  </script>
</body>
  `;
});
