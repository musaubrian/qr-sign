export default defineEventHandler(() => {
  return `
  <head>
    <link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css">
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
<body>
  <h1 style="text-align: center;">Login</h1>
  <form method="POST" style="display: flex; width: 90%; flex-direction: column; gap: 1rem;" action="/api/auth/login" onsubmit="event.preventDefault(); login();">
    <input type="email" id="email" placeholder="Email" required />
    <input type="password" id="password" placeholder="Password" required />
    <button type="submit">Login</button>
  </form>
  <a style="font-size: 2rem;" href="/auth/qr">Login with QR code</a>

  <script>
    async function login() {
      const email = document.getElementById('email').value
      const password = document.getElementById('password').value

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!res.ok) return alert('Login failed')
      const { token, user } = await res.json()

      localStorage.setItem('jwt', token)
      localStorage.setItem('user', user)
      location.href = '/'
    }
  </script>
</body>
  `;
});
