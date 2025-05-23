export default defineEventHandler(() => {
  return `
<!DOCTYPE html>
  <head>
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
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const devices = JSON.parse(localStorage.getItem("devices"))

    function navigate(path) {
      window.location.href = path
    }

    if (!token) {
      location.href = '/auth/login'
    } else {
      document.getElementById('out').innerText = 'Welcome ' + user.email
      let html = '<table><thead><tr><th>Device ID</th><th>Platform</th><th>Language</th></tr></thead><tbody>'
      for (const [id, info] of Object.entries(devices || {})) {
        const shortId = id.slice(0, 8) + '...'
        html += \`<tr><td>\${shortId}</td><td>\${info.platform}</td><td>\${info.language}</td></tr>\`
      }

      html += '</tbody></table>'

      document.getElementById('devices').innerHTML = html
    }

    function logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('devices')
      location.href = '/auth/login'
    }
  </script>
  `;
});
