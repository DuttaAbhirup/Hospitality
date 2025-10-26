document.addEventListener('DOMContentLoaded', () => {

  // --- LOGIN PAGE ---
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!username || !password) {
        alert('Please enter both username and password.');
        return;
      }

      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'menu.html';
      } else {
        alert('Invalid username or password!');
      }
    });

    // redirect logged-in users automatically
    if (localStorage.getItem('isLoggedIn') === 'true') {
      window.location.href = 'menu.html';
    }
  }

  // --- MENU PAGE ---
  const menuItems = document.querySelectorAll('.menu-card');
  const contentTitle = document.querySelector('#content h2');
  const contentDetail = document.getElementById('detail');
  const logoutBtn = document.getElementById('logoutBtn');

  if (menuItems.length > 0) {
    // restore active from localStorage
    const saved = localStorage.getItem('activeModule');
    if (saved) {
      const el = document.querySelector(`.menu-card[data-module="${saved}"]`);
      if (el) setActive(el, false);
    }

    // click handler
    menuItems.forEach(item => item.addEventListener('click', () => {
      setActive(item, true);
    }));
  }

  // logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('activeModule');
      window.location.href = 'index.html';
    });
  }

  // set active menu function
  function setActive(element, save) {
    menuItems.forEach(i => i.classList.remove('active'));
    element.classList.add('active');

    const moduleKey = element.getAttribute('data-module') || element.textContent.trim();
    if (save) localStorage.setItem('activeModule', moduleKey);

    if (contentTitle) contentTitle.textContent = element.querySelector('.label')?.textContent || element.textContent.trim();
    if (contentDetail) contentDetail.textContent = `You opened: ${moduleKey}. (Module implementation pending.)`;
  }

});
