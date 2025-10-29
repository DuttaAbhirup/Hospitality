document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const userInfo = document.getElementById("userInfo");
  const logoutBtn = document.getElementById("logoutBtn");
  const menuCards = document.querySelectorAll(".menu-card");
  const content = document.getElementById("content");

  // Redirect if not logged in
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // Show user info
  userInfo.textContent = `Logged in as: ${user.username} (${user.role})`;

  // Logout button
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
  });

  // Show only allowed menu cards
  menuCards.forEach((card) => {
    const roles = card.dataset.role.split(",");
    if (!roles.includes(user.role)) {
      card.style.display = "none";
    }
  });

  // Handle menu clicks
  menuCards.forEach((card) => {
    card.addEventListener("click", () => {
      const module = card.dataset.module;

      // If Booking module
      if (module === "booking") {
        console.log("Opening embedded booking module...");
        // Booking content already in menu.html
        const bookingContainer = document.querySelector(".booking-container");
        if (bookingContainer) {
          document.querySelectorAll(".booking-container, .modal").forEach(el => el.classList.add("active"));
          initBookingModule(); // ensure handlers are set
        }
      } else {
        // Placeholder for other modules
        content.innerHTML = `
          <h2>${card.querySelector(".label").textContent}</h2>
          <p>Module content for <b>${module}</b> will appear here.</p>
        `;
      }
    });
  });
});


// ------------------------------
// Booking Module Functionality
// ------------------------------
function initBookingModule() {
  console.log("Booking module initialized.");

  const tabs = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const modal = document.getElementById("bookingModal");
  const closeModal = modal?.querySelector(".close, .close-btn");

  // Tabs switching
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab)?.classList.add("active");
    });
  });

  // Modal open/close logic
  const bookingTable = document.getElementById("bookingTableBody");
  bookingTable?.addEventListener("click", (e) => {
    if (e.target.classList.contains("view-btn")) {
      modal.classList.add("active");
    }
  });

  closeModal?.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });

  // Quantity controls
  function initQuantityControls(scope = document) {
    scope.querySelectorAll(".quantity-control, .counter").forEach((qc) => {
      const minus = qc.querySelector(".minus, .dec");
      const plus = qc.querySelector(".plus, .inc");
      const input = qc.querySelector("input[type='number']");
      minus?.addEventListener("click", () => {
        let val = parseInt(input.value) || 1;
        if (val > 1) input.value = val - 1;
      });
      plus?.addEventListener("click", () => {
        let val = parseInt(input.value) || 1;
        input.value = val + 1;
      });
    });
  }
  initQuantityControls();

  // Add another room
  const addRoomBtn = document.getElementById("addRoom");
  const roomContainer = document.getElementById("roomContainer");
  addRoomBtn?.addEventListener("click", () => {
    const newRoom = document.createElement("div");
    newRoom.classList.add("room-line");
    newRoom.innerHTML = `
      <label>Room Type:
        <select>
          <option>Deluxe</option>
          <option>Suite</option>
          <option>Standard</option>
        </select>
      </label>
      <div class="quantity-control">
        <button class="minus">-</button>
        <input type="number" min="1" value="1">
        <button class="plus">+</button>
      </div>
    `;
    roomContainer.appendChild(newRoom);
    initQuantityControls(newRoom);
  });
}
