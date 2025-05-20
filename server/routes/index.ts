export default defineEventHandler(() => {
  return `
  <head>
    <link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css">
  </head>
  <h1>Protected Page</h1>
  <div id="out">Loading...</div>
  <br/>
  <br/>
  <button onclick="navigate('/scan')">Scan</button>

  <br/>
  <button onclick="logout()">Logout</button>

  <script>
    const token = localStorage.getItem('jwt')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    function navigate(path) {
      window.location.href = path
    }

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
