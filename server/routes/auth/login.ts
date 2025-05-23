export default defineEventHandler(() => {
  return `
<!DOCTYPE html>
  <head>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css">
<style>
      body {
        height: 100svh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 90%;
      }
      input, button {
        padding: 1rem;
      }
</style>
  </head>
<body>
  <h1 style="text-align: center;">Login</h1>
  <form method="POST" action="/api/auth/login" onsubmit="event.preventDefault(); login();">
    <input type="email" id="email" placeholder="Email" required />
    <input type="password" id="password" placeholder="Password" required />
    <button type="submit">Login</button>
  </form>
  <a style="margin-top: 1rem;" href="/auth/qr">Login with QR code</a>

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
      const { token, user, devices } = await res.json()

      localStorage.setItem('jwt', token)
      localStorage.setItem('user', user)
      localStorage.setItem('devices', JSON.stringify(devices))
      location.href = '/'
    }
  </script>
</body>
  `;
});
