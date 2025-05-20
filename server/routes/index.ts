export default defineEventHandler(() => {
  return `
  <h1>Protected Page</h1>
  <div id="out">Loading...</div>
  <button onclick="logout()">Logout</button>

  <script>
    const token = localStorage.getItem('jwt')
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (!token) location.href = '/auth/login'
    else document.getElementById('out').innerText = 'Welcome ' + user.email

    function logout() {
      localStorage.removeItem('jwt')
      localStorage.removeItem('user')
      location.href = '/auth/login'
    }
  </script>
  `;
});
