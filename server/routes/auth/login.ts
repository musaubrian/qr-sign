export default defineEventHandler(() => {
  return `
  <h1>Email/Password Login</h1>
  <form method="POST" action="/api/auth/login" onsubmit="event.preventDefault(); login();">
    <input type="email" id="email" placeholder="Email" required />
    <input type="password" id="password" placeholder="Password" required />
    <button type="submit">Login</button>
  </form>
  <a href="/auth/qr">Login with QR code</a>

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
      const { token } = await res.json()

      localStorage.setItem('jwt', token)
      location.href = '/'
    }
  </script>
  `;
});
