# Project Structure

## Root Directory
- `README.md` - Main project documentation
- `package.json` - Root package configuration with concurrent scripts
- `ARCHITECTURE.md` - System architecture diagram
- `SYSTEM_OVERVIEW.md` - Complete system overview
- `MODEL_CONFIG.md` - Guide for configuring AI models
- `DATA_FLOW.md` - Data flow diagram

## Backend (`/backend`)
- `server.js` - Main Node.js server with Express
- `package.json` - Backend dependencies
- `.env` - Environment variables (includes your Gemini API key)
- `test-gemini.js` - Script to test Gemini API integration
- `test-models.js` - Script to test different model names
- `test-api-key.js` - Comprehensive API key and model tester
- `node_modules/` - Backend dependencies

## Frontend (`/frontend`)
- `index.html` - Main HTML file
- `vite.config.js` - Vite configuration with proxy setup
- `package.json` - Frontend dependencies
- `src/` - Source code directory
  - `main.jsx` - React entry point
  - `App.jsx` - Main React component
  - `App.css` - Component styling
  - `index.css` - Global styling
- `node_modules/` - Frontend dependencies

## Key Features Implemented

1. **Story Intelligence Engine** - Analyzes stories for emotions, confidence, intent, and style
2. **Compliment Personality Engine** - Four distinct compliment modes with auto-selection
3. **Real-time Processing** - Instant analysis and compliment generation
4. **Responsive UI** - Modern React interface with mode selection
5. **API Integration** - Full integration with Gemini AI
6. **Development Tooling** - Comprehensive testing and configuration tools

## How to Run

1. **Install Dependencies**:
   ```bash
   # In backend directory
   npm install
   
   # In frontend directory
   npm install
   ```

2. **Start Development Servers**:
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   npm run dev
   ```

3. **Or start both concurrently** (from root directory):
   ```bash
   npm run dev
   ```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **Compliment API**: http://localhost:5000/api/compliment (POST)

## API Usage

Send a POST request to `/api/compliment` with:
```json
{
  "story": "Your story text here...",
  "mode": "hype|softCare|bestFriend|deepSoul|auto"
}
```

Receive:
```json
{
  "analysis": {
    "emotionLevel": "...",
    "confidenceLevel": 0,
    "storyIntent": "...",
    "writingStyle": "..."
  },
  "compliment": "Your personalized compliment here..."
}
```