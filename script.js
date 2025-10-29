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
    card.addEventListener("click", async () => {
      const module = card.dataset.module;

      if (module === "booking") {
        try {
          const tpl = document.getElementById("booking-template");
          const contentEl = document.getElementById("content");

          if (tpl && contentEl) {
            // Inline template version
            console.log("Injecting inline booking template...");
            contentEl.innerHTML = tpl.innerHTML;
            setTimeout(() => {
              try {
                initBookingModule();
              } catch (e) {
                console.error("initBookingModule failed:", e);
              }
            }, 0);
          } else {
            // Fallback to fetch version
            console.log("No inline template found — fetching booking.html...");
            const res = await fetch("booking.html");
            const html = await res.text();
            contentEl.innerHTML = html;
            setTimeout(() => {
              try {
                initBookingModule();
              } catch (e) {
                console.error("initBookingModule failed after fetch:", e);
              }
            }, 0);
          }
        } catch (err) {
          console.error("Error loading booking module:", err);
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
  const closeModal = modal?.querySelector(".close");

  // Tabs functionality
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab)?.classList.add("active");
    });
  });

  // Modal functionality
  if (modal && closeModal) {
    closeModal.addEventListener("click", () => {
      modal.classList.remove("active");
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("active");
    });
  }

  // Open modal on action click (example)
  const bookingTable = document.getElementById("bookingTableBody");
  bookingTable?.addEventListener("click", (e) => {
    if (e.target.classList.contains("view-btn")) {
      modal.classList.add("active");
    }
  });

  // Quantity control
  document.querySelectorAll(".quantity-control").forEach((qc) => {
    const minus = qc.querySelector(".minus");
    const plus = qc.querySelector(".plus");
    const input = qc.querySelector("input");

    minus?.addEventListener("click", () => {
      let val = parseInt(input.value);
      if (val > 1) input.value = val - 1;
    });

    plus?.addEventListener("click", () => {
      let val = parseInt(input.value);
      input.value = val + 1;
    });
  });

  // Add another room line
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
  });
}
