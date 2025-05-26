// Global variables
let mediaItems = [];
let editingId = null;

// DOM elements
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const statusFilter = document.getElementById("statusFilter");
const mediaContainer = document.getElementById("mediaContainer");
const mediaModal = document.getElementById("mediaModal");
const mediaForm = document.getElementById("mediaForm");
const modalTitle = document.getElementById("modalTitle");

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  // Wait for auth manager to initialize
  setTimeout(() => {
    loadMedia();
    setupEventListeners();
  }, 100);
});

// Setup event listeners
function setupEventListeners() {
  searchInput.addEventListener("input", debounce(performSearch, 300));
  typeFilter.addEventListener("change", performSearch);
  statusFilter.addEventListener("change", performSearch);
  mediaForm.addEventListener("submit", handleFormSubmit);

  // Close modal when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === mediaModal) {
      closeModal();
    }
  });

  // Close profile menu when clicking outside
  document.addEventListener("click", function (event) {
    const profileMenu = document.getElementById("profileMenu");
    const profileInfo = document.querySelector(".profile-info");

    if (
      profileMenu &&
      profileMenu.style.display === "block" &&
      !profileMenu.contains(event.target) &&
      profileInfo &&
      !profileInfo.contains(event.target)
    ) {
      profileMenu.style.display = "none";
    }
  });
}

// Debounce function for search input
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Load all media items
async function loadMedia() {
  try {
    // Get current user from auth manager
    const currentUser = window.authManager
      ? authManager.getCurrentUser()
      : profileManager.getCurrentProfile();
    if (!currentUser) {
      mediaItems = [];
      displayMedia(mediaItems);
      return;
    }

    const profileKey = `profile_${currentUser.id}`;

    // Store media items per profile in localStorage
    const allProfileData = JSON.parse(
      localStorage.getItem("profileMediaData") || "{}"
    );
    if (allProfileData[profileKey]) {
      mediaItems = allProfileData[profileKey];
    } else {
      mediaItems = [];
    }

    displayMedia(mediaItems);

    // Update profile stats
    if (window.profileManager) {
      profileManager.updateProfileStats(mediaItems);
    }
  } catch (error) {
    console.error("Error loading media:", error);
    showError("Failed to load media items");
  }
}

// Save media items for current profile
function saveMediaToProfile() {
  const currentUser = window.authManager
    ? authManager.getCurrentUser()
    : profileManager.getCurrentProfile();
  if (!currentUser) return;

  const profileKey = `profile_${currentUser.id}`;

  const allProfileData = JSON.parse(
    localStorage.getItem("profileMediaData") || "{}"
  );
  allProfileData[profileKey] = mediaItems;
  localStorage.setItem("profileMediaData", JSON.stringify(allProfileData));
}

// Perform search with filters
async function performSearch() {
  const query = searchInput.value.trim();
  const type = typeFilter.value;
  const status = statusFilter.value;

  let filtered = [...mediaItems];

  // Filter by search query
  if (query) {
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.creator.toLowerCase().includes(query.toLowerCase()) ||
        (item.genre && item.genre.toLowerCase().includes(query.toLowerCase()))
    );
  }

  // Filter by type
  if (type) {
    filtered = filtered.filter((item) => item.type === type);
  }

  // Filter by status
  if (status) {
    filtered = filtered.filter((item) => item.status === status);
  }

  displayMedia(filtered);
}

// Display media items
function displayMedia(items) {
  if (items.length === 0) {
    mediaContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No media items found</h3>
                <p>Start building your collection by adding your first item!</p>
            </div>
        `;
    return;
  }

  const mediaGrid = document.createElement("div");
  mediaGrid.className = "media-grid";

  items.forEach((item) => {
    const card = createMediaCard(item);
    mediaGrid.appendChild(card);
  });

  mediaContainer.innerHTML = "";
  mediaContainer.appendChild(mediaGrid);
}

// Create a media card
function createMediaCard(item) {
  const card = document.createElement("div");
  card.className = "media-card";

  const statusClass = `status-${item.status.replace(" ", "-")}`;
  const typeClass = `type-${item.type}`;

  card.innerHTML = `
        <div class="media-header">
            <div>
                <div class="media-title">${escapeHtml(item.title)}</div>
                <div class="media-creator">by ${escapeHtml(item.creator)}</div>
            </div>
            <div class="media-actions">
                <button class="btn-secondary btn-small" onclick="editMedia(${
                  item.id
                })" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger btn-small" onclick="deleteMedia(${
                  item.id
                })" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        
        <div class="media-info">
            <div class="info-row">
                <span class="info-label">Type:</span>
                <span class="type-badge ${typeClass}">${item.type}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="status-badge ${statusClass}">${item.status}</span>
            </div>
            ${
              item.genre
                ? `
                <div class="info-row">
                    <span class="info-label">Genre:</span>
                    <span>${escapeHtml(item.genre)}</span>
                </div>
            `
                : ""
            }
            ${
              item.releaseDate
                ? `
                <div class="info-row">
                    <span class="info-label">Release Date:</span>
                    <span>${formatDate(item.releaseDate)}</span>
                </div>
            `
                : ""
            }
            ${
              item.rating
                ? `
                <div class="info-row">
                    <span class="info-label">Rating:</span>
                    <span>${item.rating}/10 ${"★".repeat(
                    Math.round(item.rating / 2)
                  )}</span>
                </div>
            `
                : ""
            }
        </div>
        
        ${
          item.notes
            ? `
            <div style="margin-top: 10px; padding: 10px; background: var(--bg-color); border-radius: 5px; font-size: 0.9rem;">
                <strong>Notes:</strong> ${escapeHtml(item.notes)}
            </div>
        `
            : ""
        }
    `;

  return card;
}

// Open add modal
function openAddModal() {
  // Check if user is logged in
  const currentUser = window.authManager
    ? authManager.getCurrentUser()
    : profileManager.getCurrentProfile();
  if (!currentUser) {
    showError("Please log in to add media items");
    return;
  }

  editingId = null;
  modalTitle.textContent = "Add New Media";
  mediaForm.reset();
  mediaModal.style.display = "block";
}

// Edit media item
async function editMedia(id) {
  try {
    const item = mediaItems.find((m) => m.id === id);
    if (!item) {
      showError("Media item not found");
      return;
    }

    editingId = id;
    modalTitle.textContent = "Edit Media";

    // Populate form
    document.getElementById("title").value = item.title;
    document.getElementById("creator").value = item.creator;
    document.getElementById("type").value = item.type;
    document.getElementById("genre").value = item.genre || "";
    document.getElementById("releaseDate").value = item.releaseDate || "";
    document.getElementById("status").value = item.status;
    document.getElementById("rating").value = item.rating || "";
    document.getElementById("notes").value = item.notes || "";

    mediaModal.style.display = "block";
  } catch (error) {
    console.error("Error loading media for edit:", error);
    showError("Failed to load media item for editing");
  }
}

// Delete media item
async function deleteMedia(id) {
  if (!confirm("Are you sure you want to delete this media item?")) {
    return;
  }

  try {
    const index = mediaItems.findIndex((m) => m.id === id);
    if (index !== -1) {
      mediaItems.splice(index, 1);
      saveMediaToProfile();
      showSuccess("Media item deleted successfully");
      loadMedia();
    } else {
      throw new Error("Media item not found");
    }
  } catch (error) {
    console.error("Error deleting media:", error);
    showError("Failed to delete media item");
  }
}

// Handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();

  const formData = {
    id: editingId || Date.now(),
    title: document.getElementById("title").value.trim(),
    creator: document.getElementById("creator").value.trim(),
    type: document.getElementById("type").value,
    genre: document.getElementById("genre").value.trim(),
    releaseDate: document.getElementById("releaseDate").value,
    status: document.getElementById("status").value,
    rating: document.getElementById("rating").value
      ? parseFloat(document.getElementById("rating").value)
      : null,
    notes: document.getElementById("notes").value.trim(),
    createdAt: editingId
      ? mediaItems.find((m) => m.id === editingId)?.createdAt
      : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    if (editingId) {
      const index = mediaItems.findIndex((m) => m.id === editingId);
      if (index !== -1) {
        mediaItems[index] = formData;
      }
    } else {
      mediaItems.push(formData);
    }

    saveMediaToProfile();
    showSuccess(
      editingId
        ? "Media item updated successfully"
        : "Media item added successfully"
    );
    closeModal();
    loadMedia();
  } catch (error) {
    console.error("Error saving media:", error);
    showError("Failed to save media item");
  }
}

// Generate AI Recommendations
function generateRecommendations() {
  if (mediaItems.length === 0) {
    showError(
      "Add some media items first to get personalized recommendations!"
    );
    return;
  }

  const recommendations = aiEngine.generateRecommendations(mediaItems);
  displayRecommendations(recommendations);

  // Show recommendations section
  document.getElementById("recommendationsSection").style.display = "block";

  showSuccess("AI recommendations generated based on your collection!");
}

// Display AI recommendations
function displayRecommendations(recommendations) {
  const grid = document.getElementById("recommendationsGrid");

  if (recommendations.length === 0) {
    grid.innerHTML = "<p>No recommendations available at the moment.</p>";
    return;
  }

  grid.innerHTML = recommendations
    .map(
      (rec) => `
    <div class="recommendation-card">
      <div class="rec-title">${escapeHtml(rec.title)}</div>
      <div class="rec-reason">${escapeHtml(rec.reason)}</div>
      <div class="rec-confidence">
        <span>${rec.confidence}% match</span>
        <div class="confidence-bar">
          <div class="confidence-fill" style="width: ${rec.confidence}%"></div>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

// Close modal
function closeModal() {
  mediaModal.style.display = "none";
  editingId = null;
  mediaForm.reset();
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function showSuccess(message) {
  showNotification(message, "success");
}

function showError(message) {
  showNotification(message, "error");
}

function showInfo(message) {
  showNotification(message, "info");
}

function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 350px;
        word-wrap: break-word;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

  // Set background color based on type
  switch (type) {
    case "success":
      notification.style.background = "var(--success-color, #28a745)";
      break;
    case "error":
      notification.style.background = "var(--error-color, #dc3545)";
      break;
    case "info":
      notification.style.background = "var(--info-color, #17a2b8)";
      break;
    default:
      notification.style.background = "#6c757d";
  }

  // Add icon based on type
  const icons = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    info: "fas fa-info-circle",
  };

  notification.innerHTML = `
    <i class="${icons[type] || "fas fa-bell"}"></i>
    <span style="margin-left: 8px;">${message}</span>
  `;

  // Add animation styles if not already added
  if (!document.getElementById("notification-styles")) {
    const style = document.createElement("style");
    style.id = "notification-styles";
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Remove notification after 4 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

// Make functions globally available
window.showSuccess = showSuccess;
window.showError = showError;
window.showInfo = showInfo;
window.showNotification = showNotification;
window.loadMedia = loadMedia;
window.mediaItems = mediaItems;
