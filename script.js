// script.js — robust login + role-based menu
document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------
     LOGIN PAGE
     ---------------------- */
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');

    // Defensive: if error elements missing, create no-op objects
    const showEl = (el, text) => {
      if (!el) return;
      el.textContent = text || '';
      el.style.display = text ? 'block' : 'none';
    };

    // initialize hidden
    showEl(usernameError, '');
    showEl(passwordError, '');

    // auto-redirect if already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
      console.log('Already logged in — redirecting to menu.html');
      window.location.href = './menu.html';
      return;
    }

    loginForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      // clear errors
      showEl(usernameError, '');
      showEl(passwordError, '');

      const username = (document.getElementById('username')?.value || '').trim();
      const password = (document.getElementById('password')?.value || '').trim();

      if (!username || !password) {
        if (!username) showEl(usernameError, 'Username is required');
        if (!password) showEl(passwordError, 'Password is required');
        return;
      }

      try {
        console.log('Posting login to webhook...', { username });
        const resp = await fetch('https://n8n.srv850749.hstgr.cloud/webhook/bf58870b-841f-415d-8d58-8522bfc1ca6e', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (!resp.ok) {
          console.error('Webhook returned non-OK:', resp.status, resp.statusText);
          alert('Login service error. Try again later.');
          return;
        }

        const data = await resp.json();
        console.log('Webhook response:', data);

        // expected: { status: "Success"|"Wrong Username"|"Wrong Password", username: "...", role: "..." }
        const status = (data?.status || '').toString();

        if (status === 'Success') {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userName', data.username || username);
          localStorage.setItem('userRole', data.role || '');
          // clear errors and redirect
          showEl(usernameError, '');
          showEl(passwordError, '');
          window.location.href = './menu.html';
        } else if (status === 'Wrong Username') {
          showEl(usernameError, 'Incorrect Username');
          showEl(passwordError, 'Incorrect Password'); // you wanted both for this case
        } else if (status === 'Wrong Password') {
          showEl(usernameError, '');
          showEl(passwordError, 'Incorrect Password');
        } else {
          console.warn('Unexpected login status:', data);
          alert('Unexpected response from server.');
        }

      } catch (err) {
        console.error('Login error:', err);
        alert('Failed to login. Please try again later.');
      }
    });
  } // end loginForm block


  /* ----------------------
     MENU PAGE
     ---------------------- */
  const menuItemsAll = Array.from(document.querySelectorAll('.menu-card'));
  const contentTitle = document.querySelector('#content h2');
  const contentDetail = document.getElementById('detail');
  const logoutBtn = document.getElementById('logoutBtn');

  if (menuItemsAll.length > 0) {
    // protect route
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      console.log('Not logged in — redirecting to index.html');
      window.location.href = './index.html';
      return;
    }

    const name = localStorage.getItem('userName') || '';
    const roleRaw = localStorage.getItem('userRole') || '';
    const userRole = (roleRaw || '').replace(/\s+/g, '').toLowerCase();

    console.log('Menu page loaded for user:', { name, userRole });

    // show user info in topbar
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
      userInfo.innerHTML = name ? `Welcome, ${name} <br/><small>${roleRaw}</small>` : `<small>${roleRaw}</small>`;
    }

    // role-based visibility using data-role attribute on each card
    // data-role example: "Admin,Manager" or "Admin" or missing (means visible to all)
    const visibleMenuItems = [];
    menuItemsAll.forEach(item => {
      const roleAttr = item.getAttribute('data-role');
      if (!roleAttr) {
        // no restriction -> visible
        item.style.display = '';
        visibleMenuItems.push(item);
        return;
      }

      // parse allowed roles, normalize to lowercase
      const allowed = roleAttr.split(',').map(r => r.trim().toLowerCase()).filter(Boolean);
      // if userRole is empty (not present), hide restricted items
      if (!userRole) {
        item.style.display = 'none';
        return;
      }

      if (allowed.includes(userRole) || allowed.includes('all')) {
        item.style.display = '';
        visibleMenuItems.push(item);
      } else {
        item.style.display = 'none';
      }
    });

    console.log('Visible menu items count:', visibleMenuItems.length);

    // restore active module if it's visible
    const saved = localStorage.getItem('activeModule');
    if (saved) {
      const el = document.querySelector(`.menu-card[data-module="${saved}"]`);
      if (el && el.style.display !== 'none') {
        setActive(el, false);
      } else {
        // saved module not visible/hide it
        localStorage.removeItem('activeModule');
      }
    }

    // attach handlers only to visible items
    visibleMenuItems.forEach(item => {
  item.addEventListener('click', async () => {
    setActive(item, true);

    const module = item.dataset.module;

    // dynamically load module content
    if (module === 'booking') {
      try {
        const res = await fetch('booking.html');
        const html = await res.text();
        document.getElementById('content').innerHTML = html;
        initBookingModule(); // initialize the tab behavior
      } catch (err) {
        console.error('Error loading booking module:', err);
      }
    } else {
      // fallback for other modules
      document.getElementById('content').innerHTML = `
        <h2>${item.querySelector('.label')?.textContent || module}</h2>
        <p id="detail">You opened: ${module}. (Module implementation pending.)</p>
      `;
    }
  });
});
  } // end menu block

  // logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('activeModule');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      window.location.href = './index.html';
    });
  }

  // helper: setActive
  function setActive(element, save) {
    const currentMenuItems = Array.from(document.querySelectorAll('.menu-card'));
    currentMenuItems.forEach(i => i.classList.remove('active'));
    if (!element) return;
    element.classList.add('active');

    const moduleKey = element.getAttribute('data-module') || element.textContent.trim();
    if (save) localStorage.setItem('activeModule', moduleKey);

    if (contentTitle)
      contentTitle.textContent = element.querySelector('.label')?.textContent || moduleKey;
    if (contentDetail)
      contentDetail.textContent = `You opened: ${moduleKey}. (Module implementation pending.)`;
  }

  // initialize the booking management module
function initBookingModule() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  const filterBtn = document.getElementById('filterBtn');
  const tbody = document.getElementById('bookingTableBody');
  if (filterBtn) {
    filterBtn.addEventListener('click', () => {
      tbody.innerHTML = `
        <tr>
          <td>#B123</td>
          <td>John Doe</td>
          <td>2025-10-29</td>
          <td>2025-10-31</td>
          <td>Confirmed</td>
        </tr>
      `;
    });
  }

  const createBookingForm = document.getElementById('createBookingForm');
  if (createBookingForm) {
    createBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Booking created successfully!');
      createBookingForm.reset();
    });
  }
}


}); // DOMContentLoaded end
