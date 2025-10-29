// script.js — robust login + role-based menu
document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------
     LOGIN PAGE
     ---------------------- */
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');

    const showEl = (el, text) => {
      if (!el) return;
      el.textContent = text || '';
      el.style.display = text ? 'block' : 'none';
    };

    showEl(usernameError, '');
    showEl(passwordError, '');

    if (localStorage.getItem('isLoggedIn') === 'true') {
      console.log('Already logged in — redirecting to menu.html');
      window.location.href = './menu.html';
      return;
    }

    loginForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
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

        const status = (data?.status || '').toString();

        if (status === 'Success') {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userName', data.username || username);
          localStorage.setItem('userRole', data.role || '');
          showEl(usernameError, '');
          showEl(passwordError, '');
          window.location.href = './menu.html';
        } else if (status === 'Wrong Username') {
          showEl(usernameError, 'Incorrect Username');
          showEl(passwordError, 'Incorrect Password');
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
  }


  /* ----------------------
     MENU PAGE
     ---------------------- */
  const menuItemsAll = Array.from(document.querySelectorAll('.menu-card'));
  const contentTitle = document.querySelector('#content h2');
  const contentDetail = document.getElementById('detail');
  const logoutBtn = document.getElementById('logoutBtn');

  if (menuItemsAll.length > 0) {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      console.log('Not logged in — redirecting to index.html');
      window.location.href = './index.html';
      return;
    }

    const name = localStorage.getItem('userName') || '';
    const userRole = (localStorage.getItem('userRole') || '').toLowerCase();
    console.log('Menu page loaded for user:', { name, userRole });

    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
      userInfo.innerHTML = name ? `Welcome, ${name} <br/><small>${userRole}</small>` : `<small>${userRole}</small>`;
    }

    const visibleMenuItems = [];
    menuItemsAll.forEach(item => {
      const roleAttr = item.getAttribute('data-role');
      if (!roleAttr) {
        item.style.display = '';
        visibleMenuItems.push(item);
        return;
      }

      const allowed = roleAttr.split(',').map(r => r.trim().toLowerCase());
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

    const saved = localStorage.getItem('activeModule');
    if (saved) {
      const el = document.querySelector(`.menu-card[data-module="${saved}"]`);
      if (el && el.style.display !== 'none') {
        setActive(el, false);
      } else {
        localStorage.removeItem('activeModule');
      }
    }

    visibleMenuItems.forEach(item => {
      item.addEventListener('click', async () => {
        setActive(item, true);
        const module = item.dataset.module;

        if (module === 'booking') {
          try {
            const res = await fetch('booking.html');
            const html = await res.text();
            document.getElementById('content').innerHTML = html;
            initBookingModule(); // initialize tabs + reservations + modal
          } catch (err) {
            console.error('Error loading booking module:', err);
          }
        } else {
          document.getElementById('content').innerHTML = `
            <h2>${item.querySelector('.label')?.textContent || module}</h2>
            <p id="detail">You opened: ${module}. (Module implementation pending.)</p>
          `;
        }
      });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('activeModule');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      window.location.href = './index.html';
    });
  }

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


  /* ----------------------
   BOOKING MODULE
   ---------------------- */
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
          <td>9876543210</td>
          <td>Deluxe Suite</td>
          <td>Available</td>
          <td>₹4500</td>
          <td>2025-10-29</td>
          <td>2025-10-31</td>
          <td>Confirmed</td>
          <td>Admin</td>
          <td><button class="view-btn">View</button></td>
        </tr>
      `;

      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', openBookingModal);
      });
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

  // --- Modal handling ---
  function openBookingModal() {
  // If there's already a modal in the DOM (static in booking.html), reuse it.
  let modal = document.getElementById('bookingModal');
  let createdHere = false;

  if (!modal) {
    // create dynamic modal (same structure you used previously)
    const modalHTML = `
      <div class="modal active" id="bookingModal">
        <div class="modal-content" role="dialog" aria-modal="true">
          <div class="modal-header">
            <h3>Booking Details</h3>
            <button class="close-btn" id="closeModal" aria-label="Close modal">&times;</button>
          </div>
          <div class="modal-body">
            <p><strong>Booking ID:</strong> #B123</p>
            <p><strong>Guest Name:</strong> John Doe</p>
            <p><strong>Contact:</strong> 9876543210</p>
            <p><strong>Room Configuration:</strong> Deluxe Suite</p>
            <p><strong>Status:</strong> Confirmed</p>

            <label>Room Type:</label>
            <div id="roomContainer">
              <div class="room-line">
                <select>
                  <option>Deluxe</option>
                  <option>Suite</option>
                  <option>Standard</option>
                </select>
                <div class="counter">
                  <button type="button" class="dec">-</button>
                  <input type="number" value="1" min="1" class="room-count" style="width:60px;">
                  <button type="button" class="inc">+</button>
                </div>
              </div>
            </div>
            <button class="add-room-btn" id="addRoom">+ Add Another Room</button>

            <label>Check-in Date:</label>
            <input type="date" id="checkInDate">
            <label>Check-out Date:</label>
            <input type="date" id="checkOutDate">

            <label>Guests:</label>
            <div class="counter">
              <button type="button" id="decGuest">-</button>
              <input type="number" id="guestCount" value="2" min="1" style="width:60px;">
              <button type="button" id="incGuest">+</button>
            </div>

            <label>Total Tariff:</label>
            <div style="display:flex;align-items:center;gap:5px;">
              <span>₹</span><input type="number" id="totalTariff" placeholder="0">
            </div>

            <label>Advance Amount:</label>
            <div style="display:flex;align-items:center;gap:5px;">
              <span>₹</span><input type="number" id="advanceAmount" placeholder="0">
            </div>

            <button class="create-request-btn">Create Booking Request</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modal = document.getElementById('bookingModal');
    createdHere = true;
  } else {
    // show the existing static modal
    modal.classList.add('active');
  }

  // find close control(s) inside modal (support static markup and dynamic one)
  const closeBtn =
    modal.querySelector('#closeModal') ||
    modal.querySelector('.close') ||
    modal.querySelector('.close-btn');

  // Helper: attach inc/dec handlers for a container (works for container or a single room-line)
  function attachCounterHandlers(container) {
    if (!container) return;
    container.querySelectorAll('.inc').forEach(btn => {
      // clear previous to avoid double-attach
      btn.onclick = null;
      btn.onclick = () => {
        const input = btn.parentElement.querySelector('.room-count');
        if (!input) return;
        input.value = Math.max(parseInt(input.value || '0') + 1, 1);
      };
    });
    container.querySelectorAll('.dec').forEach(btn => {
      btn.onclick = null;
      btn.onclick = () => {
        const input = btn.parentElement.querySelector('.room-count');
        if (!input) return;
        input.value = Math.max(parseInt(input.value || '1') - 1, 1);
      };
    });
  }

  // attach handlers to existing roomContainer (whether static or dynamic)
  const roomContainer = modal.querySelector('#roomContainer');
  attachCounterHandlers(roomContainer);

  // add-room button (may be static or dynamic)
  const addRoomBtn = modal.querySelector('#addRoom');
  if (addRoomBtn) {
    addRoomBtn.onclick = (ev) => {
      ev.preventDefault();
      if (!roomContainer) return;
      // clone the first .room-line to keep structure identical
      const firstLine = roomContainer.querySelector('.room-line');
      if (!firstLine) return;
      const clone = firstLine.cloneNode(true);
      // reset numeric value on cloned input(s)
      const clonedInput = clone.querySelector('.room-count');
      if (clonedInput) clonedInput.value = 1;
      roomContainer.appendChild(clone);
      // attach handlers to the cloned line only
      attachCounterHandlers(clone);
    };
  }

  // guest +/- controls
  const incGuest = modal.querySelector('#incGuest');
  const decGuest = modal.querySelector('#decGuest');
  if (incGuest) {
    incGuest.onclick = () => {
      const gi = modal.querySelector('#guestCount');
      gi.value = parseInt(gi.value || '0') + 1;
    };
  }
  if (decGuest) {
    decGuest.onclick = () => {
      const gi = modal.querySelector('#guestCount');
      if (parseInt(gi.value || '0') > 1) gi.value = parseInt(gi.value || '0') - 1;
    };
  }

  // close behavior: close button, outside click, Esc
  function cleanupModal() {
    // remove escape handler
    document.removeEventListener('keydown', escHandler);
    // hide or remove modal
    if (createdHere) {
      // if we created the DOM, remove it
      const node = document.getElementById('bookingModal');
      if (node && node.parentElement) node.parentElement.removeChild(node);
    } else {
      // if it was static, simply hide it
      modal.classList.remove('active');
    }
    // clear onclick handlers we set on dynamic controls (optional but safe)
    if (addRoomBtn) addRoomBtn.onclick = null;
    if (incGuest) incGuest.onclick = null;
    if (decGuest) decGuest.onclick = null;
    // For cloned inc/dec we set inline onclicks; removing modal suffices
  }

  // close button
  if (closeBtn) {
    closeBtn.onclick = cleanupModal;
  }

  // click outside modal-content
  modal.onclick = (ev) => {
    if (ev.target === modal) cleanupModal();
  };

  // esc key
  const escHandler = (ev) => {
    if (ev.key === 'Escape') cleanupModal();
  };
  document.addEventListener('keydown', escHandler);
}

  }
}); // DOMContentLoaded end
