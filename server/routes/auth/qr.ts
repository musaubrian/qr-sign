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
    const prevToken = localStorage.getItem('qr_token')

    const url = new URL('/api/qrcode/', location.origin)
    if (prevToken && prevToken !== token) {
      url.searchParams.set('previous', prevToken)
    }

    const res = await fetch(url)
    const data = await res.json()

    token = data.token
    document.getElementById('qr').innerHTML = data.qr

    localStorage.setItem('qr_token', token)
    const expiryTime = data.expiresAt - Date.now();

    if (expiryTime <= 0) {
      return fetchQR();
    }

    interval = setInterval(() => checkStatus(prevToken), 2000)
    setTimeout(() => {
      clearInterval(interval)
      fetchQR()
    }, data.expiresAt - Date.now() - 10000)
  }

  async function checkStatus(prevToken) {

    const url = new URL('/api/status/' + token, location.origin)
    if (prevToken && prevToken !== token) {
      url.searchParams.set('previous', prevToken)
    }

    const res = await fetch(url)
    if (res.status === 410) return fetchQR()
    if (!res.ok) return

    const { jwt, user } = await res.json()
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
