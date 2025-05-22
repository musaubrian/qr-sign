export default defineEventHandler(() => {
  return `

<!DOCTYPE html>
  <head>
<link rel="stylesheet" href="https://fonts.xz.style/serve/inter.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css">
  </head>
  <h1>Protected Page</h1>
  <div id="out">Loading...</div>

  <br>
  <div id="devices"></div>
  <br/>
  <br/>
  <div>
    <button onclick="navigate('/scan')">Scan</button>
    <button onclick="logout()">Logout</button>
  </div>

  <script>
    const token = localStorage.getItem('jwt')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const devices = JSON.parse(localStorage.getItem("devices"))

    function navigate(path) {
      window.location.href = path
    }

    if (!token) {
      location.href = '/auth/login'
    } else {
      document.getElementById('out').innerText = 'Welcome ' + user.email
      document.getElementById('devices').innerHTML = \`<pre> \${JSON.stringify(devices)} </pre>\`
    }

    function logout() {
      localStorage.removeItem('jwt')
      localStorage.removeItem('user')
      localStorage.removeItem('devices')
      location.href = '/auth/login'
    }
  </script>
  `;
});
