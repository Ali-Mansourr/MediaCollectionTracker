// Enhanced Authentication System
class AuthenticationManager {
  constructor() {
    this.currentUser = null;
    this.users = this.loadUsers();
    this.initializeAuthSystem();
  }

  loadUsers() {
    const saved = localStorage.getItem("mediaTrackerUsers");
    return saved ? JSON.parse(saved) : {};
  }

  saveUsers() {
    localStorage.setItem("mediaTrackerUsers", JSON.stringify(this.users));
  }

  initializeAuthSystem() {
    // Create auth modals
    this.createAuthModals();

    // Check if user is logged in
    const savedUserId = localStorage.getItem("currentUserId");
    if (savedUserId && this.users[savedUserId]) {
      this.loginUser(savedUserId);
    } else {
      this.showWelcomeScreen();
    }
  }

  createAuthModals() {
    // Create login modal
    const loginModal = document.createElement("div");
    loginModal.id = "loginModal";
    loginModal.className = "modal auth-modal";
    loginModal.innerHTML = `
            <div class="modal-content auth-modal-content">
                <div class="auth-header">
                    <h2><i class="fas fa-sign-in-alt"></i> Welcome Back</h2>
                    <p>Sign in to your media collection</p>
                </div>
                
                <div class="user-list" id="userList">
                    <!-- Users will be populated here -->
                </div>
                
                <div class="auth-actions">
                    <button class="btn-secondary" onclick="authManager.showCreateUserModal()">
                        <i class="fas fa-user-plus"></i> Create New Profile
                    </button>
                    <button class="btn-primary" onclick="authManager.continueAsGuest()">
                        <i class="fas fa-user-secret"></i> Continue as Guest
                    </button>
                </div>
            </div>
        `;
    document.body.appendChild(loginModal);

    // Create user creation modal
    const createUserModal = document.createElement("div");
    createUserModal.id = "createUserModal";
    createUserModal.className = "modal auth-modal";
    createUserModal.innerHTML = `
            <div class="modal-content auth-modal-content">
                <div class="auth-header">
                    <h2><i class="fas fa-user-plus"></i> Create Profile</h2>
                    <p>Set up your personal media collection</p>
                </div>
                
                <form id="createUserForm" class="auth-form">
                    <div class="form-group">
                        <label for="userName">Display Name *</label>
                        <input type="text" id="userName" required placeholder="Enter your name" maxlength="30">
                    </div>
                    
                    <div class="form-group">
                        <label for="userEmail">Email (Optional)</label>
                        <input type="email" id="userEmail" placeholder="your@email.com">
                    </div>
                    
                    <div class="form-group">
                        <label>Choose Avatar</label>
                        <div class="avatar-selector" id="avatarSelector">
                            <div class="avatar-option selected" data-avatar="👤">👤</div>
                            <div class="avatar-option" data-avatar="👨">👨</div>
                            <div class="avatar-option" data-avatar="👩">👩</div>
                            <div class="avatar-option" data-avatar="🧑">🧑</div>
                            <div class="avatar-option" data-avatar="👦">👦</div>
                            <div class="avatar-option" data-avatar="👧">👧</div>
                            <div class="avatar-option" data-avatar="🤖">🤖</div>
                            <div class="avatar-option" data-avatar="👽">👽</div>
                            <div class="avatar-option" data-avatar="🦸">🦸</div>
                            <div class="avatar-option" data-avatar="🧙">🧙</div>
                            <div class="avatar-option" data-avatar="🎭">🎭</div>
                            <div class="avatar-option" data-avatar="🐱">🐱</div>
                        </div>
                    </div>
                    
                    <div class="auth-actions">
                        <button type="button" class="btn-secondary" onclick="authManager.showLoginModal()">
                            <i class="fas fa-arrow-left"></i> Back
                        </button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-check"></i> Create Profile
                        </button>
                    </div>
                </form>
            </div>
        `;
    document.body.appendChild(createUserModal);

    // Setup event listeners
    this.setupAuthEventListeners();
  }

  setupAuthEventListeners() {
    // Avatar selector
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("avatar-option")) {
        document
          .querySelectorAll(".avatar-option")
          .forEach((opt) => opt.classList.remove("selected"));
        e.target.classList.add("selected");
      }
    });

    // Create user form
    document
      .getElementById("createUserForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.createUser();
      });

    // Close modals when clicking outside
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("auth-modal")) {
        // Don't allow closing auth modals by clicking outside if no user is logged in
        if (this.currentUser) {
          e.target.style.display = "none";
        }
      }
    });
  }

  showWelcomeScreen() {
    this.populateUserList();
    document.getElementById("loginModal").style.display = "block";
  }

  showLoginModal() {
    document.getElementById("createUserModal").style.display = "none";
    this.populateUserList();
    document.getElementById("loginModal").style.display = "block";
  }

  showCreateUserModal() {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("createUserModal").style.display = "block";

    // Reset form
    document.getElementById("createUserForm").reset();
    document
      .querySelectorAll(".avatar-option")
      .forEach((opt) => opt.classList.remove("selected"));
    document
      .querySelector('.avatar-option[data-avatar="👤"]')
      .classList.add("selected");
  }

  populateUserList() {
    const userList = document.getElementById("userList");
    const users = Object.values(this.users);

    if (users.length === 0) {
      userList.innerHTML = `
                <div class="no-users">
                    <i class="fas fa-users"></i>
                    <p>No profiles found</p>
                    <p class="text-muted">Create your first profile to get started</p>
                </div>
            `;
      return;
    }

    userList.innerHTML = users
      .map(
        (user) => `
            <div class="user-card" onclick="authManager.loginUser('${
              user.id
            }')">
                <div class="user-avatar">${user.avatar}</div>
                <div class="user-info">
                    <div class="user-name">${this.escapeHtml(user.name)}</div>
                    <div class="user-stats">${user.stats.totalItems} items • ${
          user.stats.completedItems
        } completed</div>
                    <div class="user-date">Created ${this.formatDate(
                      user.createdAt
                    )}</div>
                </div>
                <div class="user-actions">
                    <button class="btn-small btn-danger" onclick="event.stopPropagation(); authManager.deleteUser('${
                      user.id
                    }')" title="Delete Profile">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `
      )
      .join("");
  }

  createUser() {
    const name = document.getElementById("userName").value.trim();
    const email = document.getElementById("userEmail").value.trim();
    const selectedAvatar = document.querySelector(".avatar-option.selected")
      .dataset.avatar;

    if (!name) {
      this.showNotification("Please enter a name", "error");
      return;
    }

    // Check if name already exists
    const existingUser = Object.values(this.users).find(
      (user) => user.name.toLowerCase() === name.toLowerCase()
    );

    if (existingUser) {
      this.showNotification("A profile with this name already exists", "error");
      return;
    }

    const userId = Date.now().toString();
    const newUser = {
      id: userId,
      name: name,
      email: email,
      avatar: selectedAvatar,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      stats: { totalItems: 0, favoriteGenre: "None", completedItems: 0 },
    };

    this.users[userId] = newUser;
    this.saveUsers();

    this.showNotification(`Profile "${name}" created successfully!`, "success");
    this.loginUser(userId);
  }

  loginUser(userId) {
    const user = this.users[userId];
    if (!user) {
      this.showNotification("User not found", "error");
      return;
    }

    this.currentUser = user;
    user.lastLogin = new Date().toISOString();
    this.saveUsers();
    localStorage.setItem("currentUserId", userId);

    // Hide auth modals
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("createUserModal").style.display = "none";

    // Update profile manager
    if (window.profileManager) {
      profileManager.currentProfile = userId;
      profileManager.profiles = this.users;
      profileManager.updateProfileUI();
    }

    // Reload media for this user
    if (window.loadMedia) {
      loadMedia();
    }

    this.showNotification(`Welcome back, ${user.name}!`, "success");
    this.updateAuthUI();
  }

  continueAsGuest() {
    const guestId = "guest_" + Date.now();
    const guestUser = {
      id: guestId,
      name: "Guest User",
      email: "",
      avatar: "👤",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      stats: { totalItems: 0, favoriteGenre: "None", completedItems: 0 },
      isGuest: true,
    };

    this.currentUser = guestUser;
    localStorage.setItem("currentUserId", guestId);
    localStorage.setItem("guestUser", JSON.stringify(guestUser));

    // Hide auth modals
    document.getElementById("loginModal").style.display = "none";

    this.showNotification(
      "Continuing as guest - data will be temporary",
      "info"
    );
    this.updateAuthUI();

    // Load guest data
    if (window.loadMedia) {
      loadMedia();
    }
  }

  logout() {
    if (
      !confirm(
        "Are you sure you want to log out? Any unsaved changes will be lost."
      )
    ) {
      return;
    }

    this.currentUser = null;
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("guestUser");

    // Clear profile manager
    if (window.profileManager) {
      profileManager.currentProfile = null;
    }

    this.showNotification("Logged out successfully", "success");
    this.showWelcomeScreen();
    this.updateAuthUI();
  }

  deleteUser(userId) {
    const user = this.users[userId];
    if (!user) return;

    if (
      !confirm(
        `Are you sure you want to delete the profile "${user.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    delete this.users[userId];
    this.saveUsers();

    // Clear profile data
    const profileData = JSON.parse(
      localStorage.getItem("profileMediaData") || "{}"
    );
    delete profileData[`profile_${userId}`];
    localStorage.setItem("profileMediaData", JSON.stringify(profileData));

    // If deleting current user, logout
    if (this.currentUser && this.currentUser.id === userId) {
      this.logout();
      return;
    }

    this.populateUserList();
    this.showNotification("Profile deleted successfully", "success");
  }

  updateAuthUI() {
    // Create profile section if it doesn't exist
    let profileSection = document.querySelector(".profile-section");
    if (!profileSection && this.currentUser) {
      const header = document.querySelector(".header");
      if (header) {
        profileSection = document.createElement("div");
        profileSection.className = "profile-section";
        profileSection.innerHTML = `
          <div class="profile-info" onclick="toggleProfileMenu()">
            <span class="profile-avatar">${this.currentUser.avatar}</span>
            <span class="profile-name">${this.escapeHtml(
              this.currentUser.name
            )}</span>
            <i class="fas fa-chevron-down"></i>
          </div>
          <div class="profile-menu" id="profileMenu" style="display: none;">
            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-label">Total Items:</span>
                <span class="stat-value" id="totalItems">${
                  this.currentUser.stats.totalItems
                }</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Completed:</span>
                <span class="stat-value" id="completedItems">${
                  this.currentUser.stats.completedItems
                }</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Favorite Genre:</span>
                <span class="stat-value" id="favoriteGenre">${
                  this.currentUser.stats.favoriteGenre || "None"
                }</span>
              </div>
            </div>
            <button class="btn-secondary" onclick="authManager.showCreateUserModal()">
              <i class="fas fa-user-plus"></i> New Profile
            </button>
            <button class="btn-secondary" onclick="authManager.exportCollection()">
              <i class="fas fa-download"></i> Export Collection
            </button>
            <button class="btn-secondary" onclick="document.getElementById('importFile').click()">
              <i class="fas fa-upload"></i> Import Collection
            </button>
            <button class="btn-secondary" onclick="authManager.toggleDarkMode()">
              <i class="fas fa-moon"></i> Dark Mode
            </button>
            <button class="btn-danger logout-btn" onclick="authManager.logout()">
              <i class="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        `;
        header.appendChild(profileSection);

        // Create hidden file input for import
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.id = "importFile";
        fileInput.accept = ".json";
        fileInput.style.display = "none";
        fileInput.addEventListener("change", (e) => this.importCollection(e));
        document.body.appendChild(fileInput);
      }
    }

    // Update profile section if it exists
    if (profileSection && this.currentUser) {
      const profileInfo = profileSection.querySelector(".profile-info");
      if (profileInfo) {
        profileInfo.innerHTML = `
          <span class="profile-avatar">${this.currentUser.avatar}</span>
          <span class="profile-name">${this.escapeHtml(
            this.currentUser.name
          )}</span>
          <i class="fas fa-chevron-down"></i>
        `;
      }

      // Update stats
      const totalItemsEl = document.getElementById("totalItems");
      const completedItemsEl = document.getElementById("completedItems");
      const favoriteGenreEl = document.getElementById("favoriteGenre");

      if (totalItemsEl)
        totalItemsEl.textContent = this.currentUser.stats.totalItems;
      if (completedItemsEl)
        completedItemsEl.textContent = this.currentUser.stats.completedItems;
      if (favoriteGenreEl)
        favoriteGenreEl.textContent =
          this.currentUser.stats.favoriteGenre || "None";
    }

    // Hide profile section if no user is logged in
    if (!this.currentUser && profileSection) {
      profileSection.style.display = "none";
    } else if (this.currentUser && profileSection) {
      profileSection.style.display = "block";
    }
  }

  exportCollection() {
    if (!this.currentUser) {
      this.showNotification("Please log in to export your collection", "error");
      return;
    }

    const profileKey = `profile_${this.currentUser.id}`;
    const allProfileData = JSON.parse(
      localStorage.getItem("profileMediaData") || "{}"
    );
    const mediaItems = allProfileData[profileKey] || [];

    const data = {
      profile: this.currentUser,
      mediaItems: mediaItems,
      exportDate: new Date().toISOString(),
      version: "2.0.0",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `media-collection-${this.currentUser.name}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showNotification("Collection exported successfully!", "success");
  }

  importCollection(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!this.currentUser) {
      this.showNotification("Please log in to import a collection", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (!data.mediaItems || !Array.isArray(data.mediaItems)) {
          throw new Error("Invalid file format");
        }

        const profileKey = `profile_${this.currentUser.id}`;
        const allProfileData = JSON.parse(
          localStorage.getItem("profileMediaData") || "{}"
        );

        // Merge or replace media items
        const shouldReplace = confirm(
          `Import ${data.mediaItems.length} items?\n\nClick OK to REPLACE your current collection\nClick Cancel to MERGE with your current collection`
        );

        if (shouldReplace) {
          allProfileData[profileKey] = data.mediaItems;
        } else {
          const currentItems = allProfileData[profileKey] || [];
          const mergedItems = [...currentItems];

          data.mediaItems.forEach((importItem) => {
            // Check if item already exists (by title and creator)
            const exists = mergedItems.some(
              (item) =>
                item.title.toLowerCase() === importItem.title.toLowerCase() &&
                item.creator.toLowerCase() === importItem.creator.toLowerCase()
            );

            if (!exists) {
              // Assign new ID to avoid conflicts
              importItem.id = Date.now() + Math.random();
              mergedItems.push(importItem);
            }
          });

          allProfileData[profileKey] = mergedItems;
        }

        localStorage.setItem(
          "profileMediaData",
          JSON.stringify(allProfileData)
        );

        // Reload the media
        if (window.loadMedia) {
          loadMedia();
        }

        this.showNotification(
          `Successfully imported ${data.mediaItems.length} items!`,
          "success"
        );
      } catch (error) {
        console.error("Import error:", error);
        this.showNotification(
          "Failed to import collection. Please check the file format.",
          "error"
        );
      }
    };

    reader.readAsText(file);
    // Reset file input
    event.target.value = "";
  }

  toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);
    this.showNotification(
      `${isDark ? "Dark" : "Light"} mode activated!`,
      "success"
    );
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // Utility functions
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  showNotification(message, type) {
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      alert(message);
    }
  }
}

// Global auth manager instance
const authManager = new AuthenticationManager();

// Global function for profile menu toggle
function toggleProfileMenu() {
  const menu = document.getElementById("profileMenu");
  if (menu) {
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  }
}
