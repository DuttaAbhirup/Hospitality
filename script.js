// Basic mock login for demo
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');

  // Handle login
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'menu.html';
      } else {
        alert('Invalid credentials. Try admin / admin123');
      }
    });
  }

  // Handle logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      window.location.href = 'index.html';
    });
  }

  // Redirect unauthenticated users
  if (document.body.classList.contains('menu-page')) {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      window.location.href = 'index.html';
    }
  }
});

// Module navigation placeholder
function openModule(module) {
  alert(`Opening ${module} module... (To be implemented)`);
}

// Highlight active menu item
if (document.body.classList.contains('menu-page')) {
  const menuItems = document.querySelectorAll('.menu-card');

  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // You can handle module loading here later
      console.log(`Selected module: ${item.textContent.trim()}`);
    });
  });
}

