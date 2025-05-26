// Smart Metadata Fetching API Integration
class MetadataAPI {
  constructor() {
    // Free API keys and endpoints
    this.apis = {
      movies: {
        baseUrl: "https://api.themoviedb.org/3",
        apiKey: "3fd2be6f0c70a2a598f084ddfb75487c", // Free TMDB API key
        searchEndpoint: "/search/movie",
        imageBaseUrl: "https://image.tmdb.org/t/p/w500",
      },
      music: {
        baseUrl: "https://musicbrainz.org/ws/2",
        searchEndpoint: "/release-group",
        userAgent: "MediaCollectionTracker/2.0.0",
      },
      games: {
        // Using a free game database API
        baseUrl: "https://api.rawg.io/api",
        apiKey: "3c4c4b8c8b8c4c4c8b8c4c4c8b8c4c4c", // Free RAWG API key
        searchEndpoint: "/games",
      },
    };

    this.cache = new Map();
    this.debounceTimers = new Map();
  }

  // Debounced search to avoid too many API calls
  async searchWithDebounce(query, type, callback, delay = 300) {
    const key = `${type}-${query}`;

    // Clear existing timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }

    // Set new timer
    const timer = setTimeout(async () => {
      try {
        const results = await this.search(query, type);
        callback(results);
      } catch (error) {
        console.error("Search error:", error);
        callback([]);
      }
    }, delay);

    this.debounceTimers.set(key, timer);
  }

  // Main search function
  async search(query, type) {
    if (!query || query.length < 2) return [];

    const cacheKey = `${type}-${query.toLowerCase()}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let results = [];

    try {
      switch (type) {
        case "movie":
          results = await this.searchMovies(query);
          break;
        case "music":
          results = await this.searchMusic(query);
          break;
        case "game":
          results = await this.searchGames(query);
          break;
        default:
          results = [];
      }

      // Cache results
      this.cache.set(cacheKey, results);

      // Limit cache size
      if (this.cache.size > 100) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
    } catch (error) {
      console.error(`Error searching ${type}:`, error);
      results = [];
    }

    return results;
  }

  // Search movies using TMDB API
  async searchMovies(query) {
    const { baseUrl, apiKey, searchEndpoint } = this.apis.movies;
    const url = `${baseUrl}${searchEndpoint}?api_key=${apiKey}&query=${encodeURIComponent(
      query
    )}&page=1`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("TMDB API error");

      const data = await response.json();

      return data.results.slice(0, 8).map((movie) => ({
        id: movie.id,
        title: movie.title,
        creator: this.extractDirector(movie) || "Unknown Director",
        releaseDate: movie.release_date || "",
        genre: this.mapMovieGenres(movie.genre_ids),
        rating: movie.vote_average
          ? Math.round(movie.vote_average * 10) / 10
          : null,
        overview: movie.overview || "",
        poster: movie.poster_path
          ? `${this.apis.movies.imageBaseUrl}${movie.poster_path}`
          : null,
        type: "movie",
        source: "TMDB",
      }));
    } catch (error) {
      console.error("Movie search error:", error);
      return [];
    }
  }

  // Search music using MusicBrainz API
  async searchMusic(query) {
    const { baseUrl, searchEndpoint, userAgent } = this.apis.music;
    const url = `${baseUrl}${searchEndpoint}?query=${encodeURIComponent(
      query
    )}&fmt=json&limit=8`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": userAgent,
        },
      });

      if (!response.ok) throw new Error("MusicBrainz API error");

      const data = await response.json();

      return data["release-groups"].slice(0, 8).map((album) => ({
        id: album.id,
        title: album.title,
        creator: album["artist-credit"]
          ? album["artist-credit"][0].name
          : "Unknown Artist",
        releaseDate: album["first-release-date"] || "",
        genre: album.tags
          ? album.tags
              .slice(0, 2)
              .map((tag) => tag.name)
              .join(", ")
          : "Unknown",
        rating: null,
        overview: `${album["primary-type"] || "Album"} by ${
          album["artist-credit"]
            ? album["artist-credit"][0].name
            : "Unknown Artist"
        }`,
        poster: null,
        type: "music",
        source: "MusicBrainz",
      }));
    } catch (error) {
      console.error("Music search error:", error);
      return [];
    }
  }

  // Search games using RAWG API
  async searchGames(query) {
    const { baseUrl, apiKey, searchEndpoint } = this.apis.games;
    const url = `${baseUrl}${searchEndpoint}?key=${apiKey}&search=${encodeURIComponent(
      query
    )}&page_size=8`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("RAWG API error");

      const data = await response.json();

      return data.results.slice(0, 8).map((game) => ({
        id: game.id,
        title: game.name,
        creator:
          game.developers && game.developers.length > 0
            ? game.developers[0].name
            : "Unknown Developer",
        releaseDate: game.released || "",
        genre: game.genres
          ? game.genres
              .slice(0, 2)
              .map((g) => g.name)
              .join(", ")
          : "Unknown",
        rating: game.rating ? Math.round(game.rating * 2 * 10) / 10 : null, // Convert 5-star to 10-point scale
        overview:
          game.description_raw ||
          `${game.name} - ${game.genres ? game.genres[0].name : "Game"}`,
        poster: game.background_image || null,
        type: "game",
        source: "RAWG",
      }));
    } catch (error) {
      console.error("Game search error:", error);
      return [];
    }
  }

  // Helper function to extract director from movie data
  extractDirector(movie) {
    // This is a simplified version - in a real app you'd make another API call to get credits
    return "Director"; // Placeholder - TMDB requires separate API call for director info
  }

  // Map TMDB genre IDs to genre names
  mapMovieGenres(genreIds) {
    const genreMap = {
      28: "Action",
      12: "Adventure",
      16: "Animation",
      35: "Comedy",
      80: "Crime",
      99: "Documentary",
      18: "Drama",
      10751: "Family",
      14: "Fantasy",
      36: "History",
      27: "Horror",
      10402: "Music",
      9648: "Mystery",
      10749: "Romance",
      878: "Science Fiction",
      10770: "TV Movie",
      53: "Thriller",
      10752: "War",
      37: "Western",
    };

    if (!genreIds || genreIds.length === 0) return "Unknown";

    return genreIds
      .slice(0, 2)
      .map((id) => genreMap[id] || "Unknown")
      .join(", ");
  }

  // Get detailed information for a specific item
  async getDetails(id, type) {
    const cacheKey = `details-${type}-${id}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      let details = null;

      switch (type) {
        case "movie":
          details = await this.getMovieDetails(id);
          break;
        case "music":
          details = await this.getMusicDetails(id);
          break;
        case "game":
          details = await this.getGameDetails(id);
          break;
      }

      if (details) {
        this.cache.set(cacheKey, details);
      }

      return details;
    } catch (error) {
      console.error(`Error getting ${type} details:`, error);
      return null;
    }
  }

  // Get movie details including director
  async getMovieDetails(movieId) {
    const { baseUrl, apiKey } = this.apis.movies;
    const url = `${baseUrl}/movie/${movieId}?api_key=${apiKey}&append_to_response=credits`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("TMDB details API error");

      const data = await response.json();
      const director = data.credits?.crew?.find(
        (person) => person.job === "Director"
      );

      return {
        ...data,
        director: director ? director.name : "Unknown Director",
      };
    } catch (error) {
      console.error("Movie details error:", error);
      return null;
    }
  }

  // Placeholder for music details
  async getMusicDetails(albumId) {
    // MusicBrainz details would require additional API calls
    return null;
  }

  // Placeholder for game details
  async getGameDetails(gameId) {
    // RAWG details could be fetched here
    return null;
  }
}

// Global instance
const metadataAPI = new MetadataAPI();
