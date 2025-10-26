document.addEventListener('DOMContentLoaded', () => {

  // --- LOGIN PAGE ---
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');

    // redirect logged-in users automatically
    if (localStorage.getItem('isLoggedIn') === 'true') {
      window.location.href = 'menu.html';
    }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // clear previous errors
      usernameError.textContent = '';
      passwordError.textContent = '';

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!username || !password) {
        if (!username) usernameError.textContent = 'Username is required';
        if (!password) passwordError.textContent = 'Password is required';
        return;
      }

      try {
        const response = await fetch('https://n8n.srv850749.hstgr.cloud/webhook/bf58870b-841f-415d-8d58-8522bfc1ca6e', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        /*
          Expected response format:
          {
            status: "Success" | "Wrong Username" | "Wrong Password",
            username: "John Doe",
            role: "Admin"
          }
        */

       if (data.status === 'Success') {
  usernameError.style.display = 'none';
  passwordError.style.display = 'none';

  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('userName', data.username);
  localStorage.setItem('userRole', data.role);

  window.location.href = 'menu.html';
} else if (data.status === 'Wrong Username') {
  usernameError.textContent = 'Incorrect Username';
  usernameError.style.display = 'block';

  passwordError.textContent = 'Incorrect Password';
  passwordError.style.display = 'block';
} else if (data.status === 'Wrong Password') {
  usernameError.style.display = 'none'; // hide username error
  passwordError.textContent = 'Incorrect Password';
  passwordError.style.display = 'block';
}



      } catch (err) {
        console.error('Login error:', err);
        alert('Failed to login. Please try again later.');
      }
    });
  }

  // --- MENU PAGE ---
  const menuItems = document.querySelectorAll('.menu-card');
  const contentTitle = document.querySelector('#content h2');
  const contentDetail = document.getElementById('detail');
  const logoutBtn = document.getElementById('logoutBtn');

  if (menuItems.length > 0) {
    // redirect to login if not logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      window.location.href = 'index.html';
    }

    // show username and role in topbar
    const topbar = document.querySelector('.topbar .brand');
    if (topbar) {
      const name = localStorage.getItem('userName') || '';
      const role = localStorage.getItem('userRole') || '';
      topbar.innerHTML = `Welcome, ${name} <br/> ${role}`;
    }

    // restore active module
    const saved = localStorage.getItem('activeModule');
    if (saved) {
      const el = document.querySelector(`.menu-card[data-module="${saved}"]`);
      if (el) setActive(el, false);
    }

    // menu click handler
    menuItems.forEach(item => item.addEventListener('click', () => {
      setActive(item, true);
    }));
  }

  // logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('activeModule');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      window.location.href = 'index.html';
    });
  }

  // --- helper function to set active menu ---
  function setActive(element, save) {
    menuItems.forEach(i => i.classList.remove('active'));
    element.classList.add('active');

    const moduleKey = element.getAttribute('data-module') || element.textContent.trim();
    if (save) localStorage.setItem('activeModule', moduleKey);

    if (contentTitle) contentTitle.textContent = element.querySelector('.label')?.textContent || element.textContent.trim();
    if (contentDetail) contentDetail.textContent = `You opened: ${moduleKey}. (Module implementation pending.)`;
  }

});
