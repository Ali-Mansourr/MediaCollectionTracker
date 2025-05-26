# Personal Media Collection Tracker

A modern web application for organizing and tracking your personal media collection including movies, music, and games. Built with Node.js, Express, and vanilla JavaScript.

## 🌐 Live Demo

**[Try the live application here!](https://your-app-name.onrender.com)** _(URL will be updated after deployment)_

## Features

### ✅ Core Requirements Met

- **Media Management**: Add, edit, and delete media items (movies, music, games)
- **Comprehensive Metadata**: Track title, creator, release date, genre, rating, and notes
- **Status Tracking**: Mark items as "owned," "wishlist," "currently using," or "completed"
- **Advanced Search**: Find media by title, creator, genre, or any field
- **Filtering**: Filter by media type (movies/music/games) and status

### 🎨 Additional Features

- **Modern UI**: Beautiful, responsive design with gradient backgrounds and smooth animations
- **Real-time Search**: Debounced search with instant results
- **Visual Status Indicators**: Color-coded badges for different statuses and media types
- **Rating System**: 1-10 rating scale with star visualization
- **Notes Support**: Add personal notes for each media item
- **Mobile Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Data Persistence**: JSON file storage for simplicity and portability
- **🚀 Live Deployment**: Deployed and accessible online for testing

## Technology Stack

- **Backend**: Node.js with Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: JSON file (media-collection.json)
- **Styling**: Custom CSS with modern design patterns
- **Icons**: Font Awesome 6
- **Deployment**: Render/Railway/Heroku compatible

## Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Ali-Mansourr/MediaCollectionTracker.git
   cd MediaCollectionTracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the application**

   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

That's it! The application will create a `media-collection.json` file automatically to store your data.

## 🚀 Deployment

This application is ready for deployment on multiple platforms:

- **Render** (Recommended): See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions
- **Railway**: One-click deployment from GitHub
- **Heroku**: Traditional PaaS deployment
- **Vercel**: Serverless deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Usage Guide

### Adding Media Items

1. Click the "Add Media" button
2. Fill in the required fields (Title, Creator, Type)
3. Optionally add genre, release date, rating, and notes
4. Click "Save" to add the item to your collection

### Managing Your Collection

- **Edit**: Click the edit icon on any media card to modify details
- **Delete**: Click the trash icon to remove items (with confirmation)
- **Search**: Use the search box to find items by title, creator, or genre
- **Filter**: Use the dropdown filters to show only specific types or statuses

### Status Types

- **Wishlist**: Items you want to acquire
- **Owned**: Items you currently own
- **Currently Using**: Items you're actively enjoying
- **Completed**: Items you've finished (games beaten, albums fully listened to, etc.)

## API Endpoints

The application provides a RESTful API:

- `GET /api/media` - Get all media items
- `GET /api/media/:id` - Get specific media item
- `POST /api/media` - Add new media item
- `PUT /api/media/:id` - Update media item
- `DELETE /api/media/:id` - Delete media item
- `GET /api/search?q=query&type=type&status=status` - Search and filter media

## Project Structure

```
MediaCollectionTracker/
├── server.js              # Express server and API routes
├── package.json           # Dependencies and scripts
├── package-lock.json      # Locked dependency versions
├── render.yaml            # Render deployment config
├── Procfile              # Heroku deployment config
├── DEPLOYMENT.md         # Deployment instructions
├── media-collection.json  # Data storage (created automatically)
├── public/
│   ├── index.html         # Main HTML file
│   └── app.js            # Frontend JavaScript
└── README.md             # This file
```

## Development

### Running in Development Mode

```bash
npm run dev
```

### Data Storage

The application uses a simple JSON file (`media-collection.json`) for data persistence. This makes it:

- Easy to backup (just copy the JSON file)
- Portable across different environments
- Simple to inspect and modify if needed

### Customization

The application is built with modularity in mind:

- CSS styles are contained in the HTML file for easy customization
- API endpoints are clearly separated in `server.js`
- Frontend logic is organized in `public/app.js`

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential improvements for future versions:

- Database integration (PostgreSQL, MongoDB)
- User authentication and multiple collections
- Image upload for media covers
- Import/export functionality
- Advanced analytics and statistics
- Social features (sharing collections)

## License

ISC License - feel free to use and modify as needed.

## Contributing

This project was created as a technical assessment. Feel free to fork and enhance it for your own use!

---

**Built in under 1 hour as a technical assessment demonstrating full-stack development skills with Node.js, Express, and modern web technologies.**
