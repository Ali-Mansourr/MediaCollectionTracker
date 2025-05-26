const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "media-collection.json");

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Helper functions
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// API Routes

// Get all media items
app.get("/api/media", (req, res) => {
  const media = readData();
  res.json(media);
});

// Get media item by ID
app.get("/api/media/:id", (req, res) => {
  const media = readData();
  const item = media.find((m) => m.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ error: "Media item not found" });
  }
  res.json(item);
});

// Add new media item
app.post("/api/media", (req, res) => {
  const media = readData();
  const newItem = {
    id: Date.now(),
    title: req.body.title,
    creator: req.body.creator,
    type: req.body.type, // movie, music, game
    genre: req.body.genre,
    releaseDate: req.body.releaseDate,
    status: req.body.status || "wishlist", // owned, wishlist, currently using, completed
    rating: req.body.rating || null,
    notes: req.body.notes || "",
    createdAt: new Date().toISOString(),
  };

  media.push(newItem);
  writeData(media);
  res.status(201).json(newItem);
});

// Update media item
app.put("/api/media/:id", (req, res) => {
  const media = readData();
  const index = media.findIndex((m) => m.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: "Media item not found" });
  }

  media[index] = {
    ...media[index],
    ...req.body,
    id: parseInt(req.params.id), // Ensure ID doesn't change
    updatedAt: new Date().toISOString(),
  };

  writeData(media);
  res.json(media[index]);
});

// Delete media item
app.delete("/api/media/:id", (req, res) => {
  const media = readData();
  const index = media.findIndex((m) => m.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: "Media item not found" });
  }

  media.splice(index, 1);
  writeData(media);
  res.json({ message: "Media item deleted successfully" });
});

// Search media items
app.get("/api/search", (req, res) => {
  const media = readData();
  const query = req.query.q?.toLowerCase() || "";
  const type = req.query.type;
  const status = req.query.status;

  let filtered = media;

  // Filter by search query
  if (query) {
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.creator.toLowerCase().includes(query) ||
        item.genre.toLowerCase().includes(query)
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

  res.json(filtered);
});

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Media Collection Tracker running on http://localhost:${PORT}`);
});
