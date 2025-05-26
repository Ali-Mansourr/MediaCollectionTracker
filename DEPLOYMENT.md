# Deployment Guide

This document provides instructions for deploying the Media Collection Tracker to various cloud platforms.

## 🚀 Quick Deploy Options

### Option 1: Render (Recommended - Free)

1. **Fork/Clone this repository to your GitHub account**
2. **Go to [Render.com](https://render.com) and sign up**
3. **Connect your GitHub account**
4. **Create a new Web Service**
   - Repository: Select this repository
   - Branch: `master`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Deploy!** - Render will provide you with a live URL

### Option 2: Railway (Free Tier)

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "Deploy from GitHub repo"**
4. **Select this repository**
5. **Railway will auto-detect and deploy**

### Option 3: Heroku (Free tier discontinued, but instructions included)

1. **Install Heroku CLI**
2. **Login to Heroku**: `heroku login`
3. **Create app**: `heroku create your-app-name`
4. **Deploy**: `git push heroku master`

### Option 4: Vercel (Serverless)

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Run**: `vercel`
3. **Follow the prompts**

## 🔧 Environment Variables

For production deployment, you may want to set:

- `NODE_ENV=production`
- `PORT` (usually set automatically by the platform)

## 📝 Post-Deployment

After deployment:

1. **Test the live URL**
2. **Add some sample media items**
3. **Verify all CRUD operations work**
4. **Test search and filtering**
5. **Check mobile responsiveness**

## 🌐 Live Demo

Once deployed, your app will be accessible at:

- **Render**: `https://your-app-name.onrender.com`
- **Railway**: `https://your-app-name.up.railway.app`
- **Heroku**: `https://your-app-name.herokuapp.com`
- **Vercel**: `https://your-app-name.vercel.app`

## 🔍 Monitoring

Most platforms provide:

- **Logs**: Check application logs for any issues
- **Metrics**: Monitor performance and usage
- **Alerts**: Set up notifications for downtime

## 🛠 Troubleshooting

Common issues:

- **Port binding**: Ensure your app uses `process.env.PORT`
- **Dependencies**: Make sure `package-lock.json` is included
- **File paths**: Use `path.join(__dirname, ...)` for file operations
- **CORS**: Already configured for cross-origin requests
