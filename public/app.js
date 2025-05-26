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
  loadMedia();
  setupEventListeners();
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
    const response = await fetch("/api/media");
    mediaItems = await response.json();
    displayMedia(mediaItems);
  } catch (error) {
    console.error("Error loading media:", error);
    showError("Failed to load media items");
  }
}

// Perform search with filters
async function performSearch() {
  const query = searchInput.value.trim();
  const type = typeFilter.value;
  const status = statusFilter.value;

  try {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (type) params.append("type", type);
    if (status) params.append("status", status);

    const response = await fetch(`/api/search?${params}`);
    const results = await response.json();
    displayMedia(results);
  } catch (error) {
    console.error("Error searching media:", error);
    showError("Failed to search media items");
  }
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
            <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px; font-size: 0.9rem;">
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
  editingId = null;
  modalTitle.textContent = "Add New Media";
  mediaForm.reset();
  mediaModal.style.display = "block";
}

// Edit media item
async function editMedia(id) {
  try {
    const response = await fetch(`/api/media/${id}`);
    const item = await response.json();

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
    const response = await fetch(`/api/media/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      showSuccess("Media item deleted successfully");
      loadMedia();
    } else {
      throw new Error("Failed to delete media item");
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
  };

  try {
    let response;
    if (editingId) {
      response = await fetch(`/api/media/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
    } else {
      response = await fetch("/api/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
    }

    if (response.ok) {
      showSuccess(
        editingId
          ? "Media item updated successfully"
          : "Media item added successfully"
      );
      closeModal();
      loadMedia();
    } else {
      throw new Error("Failed to save media item");
    }
  } catch (error) {
    console.error("Error saving media:", error);
    showError("Failed to save media item");
  }
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

function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;

  if (type === "success") {
    notification.style.background = "#28a745";
  } else {
    notification.style.background = "#dc3545";
  }

  notification.textContent = message;

  // Add animation styles
  const style = document.createElement("style");
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

  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}
