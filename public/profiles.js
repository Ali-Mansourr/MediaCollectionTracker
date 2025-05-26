// User Profile Management System
class ProfileManager {
  constructor() {
    this.currentProfile = null;
    this.profiles = this.loadProfiles();
    this.initializeProfileSystem();
  }

  loadProfiles() {
    const saved = localStorage.getItem("mediaTrackerProfiles");
    return saved ? JSON.parse(saved) : {};
  }

  saveProfiles() {
    localStorage.setItem("mediaTrackerProfiles", JSON.stringify(this.profiles));
  }

  createProfile(name, avatar = "👤") {
    const id = Date.now().toString();
    this.profiles[id] = {
      id,
      name,
      avatar,
      createdAt: new Date().toISOString(),
      stats: { totalItems: 0, favoriteGenre: "", completedItems: 0 },
    };
    this.saveProfiles();
    return id;
  }

  switchProfile(profileId) {
    if (this.profiles[profileId]) {
      this.currentProfile = profileId;
      localStorage.setItem("currentProfile", profileId);
      this.updateProfileUI();
      // Reload media for this profile
      loadMedia();
      return true;
    }
    return false;
  }

  getCurrentProfile() {
    if (!this.currentProfile) {
      const saved = localStorage.getItem("currentProfile");
      if (saved && this.profiles[saved]) {
        this.currentProfile = saved;
      } else {
        // Create default profile
        this.currentProfile = this.createProfile("Default User", "👤");
      }
    }
    return this.profiles[this.currentProfile];
  }

  updateProfileStats(mediaItems) {
    const profile = this.getCurrentProfile();
    if (!profile) return;

    profile.stats.totalItems = mediaItems.length;
    profile.stats.completedItems = mediaItems.filter(
      (item) => item.status === "completed"
    ).length;

    // Find favorite genre
    const genreCounts = {};
    mediaItems.forEach((item) => {
      if (item.genre) {
        genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
      }
    });

    profile.stats.favoriteGenre = Object.keys(genreCounts).reduce(
      (a, b) => (genreCounts[a] > genreCounts[b] ? a : b),
      "None"
    );

    this.saveProfiles();
    this.updateProfileUI();
  }

  initializeProfileSystem() {
    // Add profile UI to header
    const header = document.querySelector(".header");
    const profileUI = document.createElement("div");
    profileUI.className = "profile-section";
    profileUI.innerHTML = `
            <div class="profile-info" onclick="toggleProfileMenu()">
                <span class="profile-avatar">👤</span>
                <span class="profile-name">Loading...</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="profile-menu" id="profileMenu" style="display: none;">
                <div class="profile-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total Items:</span>
                        <span class="stat-value" id="totalItems">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Completed:</span>
                        <span class="stat-value" id="completedItems">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Favorite Genre:</span>
                        <span class="stat-value" id="favoriteGenre">None</span>
                    </div>
                </div>
                <button class="btn-secondary" onclick="openProfileModal()">
                    <i class="fas fa-user-plus"></i> New Profile
                </button>
                <button class="btn-secondary" onclick="exportCollection()">
                    <i class="fas fa-download"></i> Export
                </button>
                <button class="btn-secondary" onclick="toggleDarkMode()">
                    <i class="fas fa-moon"></i> Dark Mode
                </button>
            </div>
        `;
    header.appendChild(profileUI);

    this.updateProfileUI();
  }

  updateProfileUI() {
    const profile = this.getCurrentProfile();
    if (!profile) return;

    document.querySelector(".profile-avatar").textContent = profile.avatar;
    document.querySelector(".profile-name").textContent = profile.name;
    document.getElementById("totalItems").textContent =
      profile.stats.totalItems;
    document.getElementById("completedItems").textContent =
      profile.stats.completedItems;
    document.getElementById("favoriteGenre").textContent =
      profile.stats.favoriteGenre || "None";
  }
}

// AI Recommendation Engine
class AIRecommendationEngine {
  constructor() {
    this.recommendations = [];
  }

  generateRecommendations(mediaItems) {
    if (mediaItems.length === 0) return [];

    const recommendations = [];

    // Analyze user preferences
    const preferences = this.analyzePreferences(mediaItems);

    // Generate recommendations based on preferences
    const movieRecs = this.getMovieRecommendations(preferences);
    const musicRecs = this.getMusicRecommendations(preferences);
    const gameRecs = this.getGameRecommendations(preferences);

    return [...movieRecs, ...musicRecs, ...gameRecs].slice(0, 6);
  }

  analyzePreferences(mediaItems) {
    const genres = {};
    const types = {};
    const ratings = [];

    mediaItems.forEach((item) => {
      // Count genres
      if (item.genre) {
        genres[item.genre] = (genres[item.genre] || 0) + 1;
      }

      // Count types
      types[item.type] = (types[item.type] || 0) + 1;

      // Collect ratings
      if (item.rating) {
        ratings.push(item.rating);
      }
    });

    const favoriteGenre = Object.keys(genres).reduce(
      (a, b) => (genres[a] > genres[b] ? a : b),
      null
    );

    const favoriteType = Object.keys(types).reduce(
      (a, b) => (types[a] > types[b] ? a : b),
      null
    );

    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 7;

    return { favoriteGenre, favoriteType, avgRating, genres, types };
  }

  getMovieRecommendations(preferences) {
    const movieSuggestions = {
      Action: ["Mad Max: Fury Road", "John Wick", "The Matrix"],
      Drama: ["The Shawshank Redemption", "Parasite", "Moonlight"],
      Comedy: [
        "The Grand Budapest Hotel",
        "Knives Out",
        "Everything Everywhere All at Once",
      ],
      "Sci-Fi": ["Blade Runner 2049", "Arrival", "Ex Machina"],
      Horror: ["Hereditary", "The Witch", "Midsommar"],
    };

    const genre = preferences.favoriteGenre;
    if (genre && movieSuggestions[genre]) {
      return movieSuggestions[genre].slice(0, 2).map((title) => ({
        title,
        type: "movie",
        genre,
        reason: `Based on your love for ${genre} movies`,
        confidence: 85 + Math.floor(Math.random() * 10),
      }));
    }

    return [
      {
        title: "Everything Everywhere All at Once",
        type: "movie",
        genre: "Sci-Fi",
        reason: "Highly rated recent release",
        confidence: 90,
      },
    ];
  }

  getMusicRecommendations(preferences) {
    const musicSuggestions = {
      Rock: ["Arctic Monkeys - AM", "Tame Impala - Currents"],
      Pop: ["Taylor Swift - Midnights", "Harry Styles - Fine Line"],
      "Hip-Hop": ["Kendrick Lamar - DAMN.", "Tyler, The Creator - IGOR"],
      Electronic: ["Daft Punk - Random Access Memories", "Aphex Twin - Syro"],
      Jazz: ["Kamasi Washington - The Epic", "Robert Glasper - Black Radio"],
    };

    const genre = preferences.favoriteGenre;
    if (genre && musicSuggestions[genre]) {
      return musicSuggestions[genre].slice(0, 1).map((title) => ({
        title,
        type: "music",
        genre,
        reason: `Matches your ${genre} preferences`,
        confidence: 80 + Math.floor(Math.random() * 15),
      }));
    }

    return [
      {
        title: "Billie Eilish - Happier Than Ever",
        type: "music",
        genre: "Pop",
        reason: "Trending and highly rated",
        confidence: 85,
      },
    ];
  }

  getGameRecommendations(preferences) {
    const gameSuggestions = {
      RPG: ["Elden Ring", "The Witcher 3: Wild Hunt"],
      Action: ["God of War", "Spider-Man: Miles Morales"],
      Strategy: ["Civilization VI", "Total War: Warhammer III"],
      Indie: ["Hades", "Celeste"],
      Adventure: ["The Last of Us Part II", "Ghost of Tsushima"],
    };

    const genre = preferences.favoriteGenre;
    if (genre && gameSuggestions[genre]) {
      return gameSuggestions[genre].slice(0, 1).map((title) => ({
        title,
        type: "game",
        genre,
        reason: `Perfect for ${genre} fans`,
        confidence: 88 + Math.floor(Math.random() * 10),
      }));
    }

    return [
      {
        title: "Elden Ring",
        type: "game",
        genre: "RPG",
        reason: "Game of the Year winner",
        confidence: 95,
      },
    ];
  }
}

// Global instances
const profileManager = new ProfileManager();
const aiEngine = new AIRecommendationEngine();

// Global functions for UI interaction
function toggleProfileMenu() {
  const menu = document.getElementById("profileMenu");
  menu.style.display = menu.style.display === "none" ? "block" : "none";
}

function openProfileModal() {
  // Simple prompt for now - could be enhanced with a proper modal
  const name = prompt("Enter profile name:");
  const avatars = ["👤", "👨", "👩", "🧑", "👦", "👧", "🤖", "👽"];
  const avatar = avatars[Math.floor(Math.random() * avatars.length)];

  if (name) {
    const profileId = profileManager.createProfile(name, avatar);
    profileManager.switchProfile(profileId);
    showSuccess(`Profile "${name}" created and activated!`);
  }
}

function exportCollection() {
  const profile = profileManager.getCurrentProfile();
  const data = {
    profile: profile,
    mediaItems: mediaItems,
    exportDate: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `media-collection-${profile.name}-${
    new Date().toISOString().split("T")[0]
  }.json`;
  a.click();
  URL.revokeObjectURL(url);

  showSuccess("Collection exported successfully!");
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDark);
  showSuccess(`${isDark ? "Dark" : "Light"} mode activated!`);
}

// Load dark mode preference
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
}
