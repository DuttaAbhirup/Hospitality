// Basic navigation + active state persistence
document.addEventListener('DOMContentLoaded', () => {
  const menuItems = document.querySelectorAll('.menu-card');
  const contentTitle = document.querySelector('#content h2');
  const contentDetail = document.getElementById('detail');
  const logoutBtn = document.getElementById('logoutBtn');

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

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault(); // prevent default form submission

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();

      // Simple front-end validation (for demo purposes)
      if (!username || !password) {
        alert('Please enter both username and password.');
        return;
      }

      // Example: hard-coded demo credentials
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('isLoggedIn', 'true'); // mark as logged in
        window.location.href = 'menu.html'; // redirect to menu page
      } else {
        alert('Invalid username or password!');
      }
    });
  }

  // logout (example)
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('activeModule');
    // redirect to login; replace path if needed
    window.location.href = 'index.html';
  });

  function setActive(element, save) {
    menuItems.forEach(i => i.classList.remove('active'));
    element.classList.add('active');

    const moduleKey = element.getAttribute('data-module') || element.textContent.trim();
    if (save) localStorage.setItem('activeModule', moduleKey);

    // update content area (placeholder logic)
    contentTitle.textContent = element.querySelector('.label')?.textContent || element.textContent.trim();
    contentDetail.textContent = `You opened: ${moduleKey}. (Module implementation pending.)`;
    console.log('Selected:', moduleKey);
  }
});
