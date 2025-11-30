# AI Story Compliment Generator

An emotionally intelligent AI system that analyzes user stories and provides personalized compliments based on emotional analysis. Now with multilingual support for English, Hindi, and Hindlish!

## Features

- **Story Intelligence Engine**: Uses Gemini AI to analyze stories for emotions, confidence levels, intents, and writing styles
- **Multilingual Support**: Native support for English, Hindi, and Hindlish languages
- **Compliment Personality Engine**: Four distinct compliment modes (Hype, Soft Care, Best Friend, Deep Soul)
- **Instagram Story-like UI**: Modern interface inspired by Instagram stories
- **Real-time Analysis**: Instant story analysis and compliment generation
- **Auto Mode Selection**: Automatically selects the most appropriate compliment style based on story analysis
- **Language Detection**: Automatically detects user's preferred language (English, Hindi, or Hindlish)
- **Media Support**: Upload photos and videos for analysis (24-hour memory)
- **Fallback Functionality**: Heuristic-based analysis when API is unavailable

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Gemini API Key (optional - system works without it using fallback)

## Setup Instructions

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

4. Add your Gemini API key to the backend `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## Running the Application

### Backend (API Server)
```bash
cd backend
npm run dev
```

The backend server will start on port 5000.

### Frontend (React App)
```bash
cd frontend
npm run dev
```

The frontend will start on port 3000.

### Using the Instagram Story-like UI

1. Open the application in your browser
2. Write your story in the text area
3. Optionally upload a photo or video
4. Select a compliment mode from the dropdown
5. Click "Post Story" to submit
6. View your story and personalized compliment in the Instagram-like interface
7. Use the close button (×) to return to the story creation screen

### Testing Multilingual Support

To test the multilingual features:

1. Write a story in English and observe English compliments
2. Write a story in Hindi (हिंदी) and observe Hindi compliments
3. Write a story mixing Hindi and English and observe Hindlish compliments

Example Hindi story:
```
आज मैंने अपनी पढ़ाई पूरी की और बहुत खुश महसूस किया।
```

Example Hindlish story:
```
आज मैंने apni study complete की और बहुत happy feel किया।
```

## API Endpoints

- `POST /api/compliment` - Analyze a story and generate a compliment
- `GET /api/health` - Health check endpoint
- `GET /api/media/:userId` - Retrieve user's recent media (24-hour window)

## How It Works

1. User submits a story through the React frontend
2. User can optionally upload a photo or video
3. Frontend sends the story and media to the Node.js backend
4. Backend stores media for 24 hours and analyzes content
5. Backend uses Gemini AI to analyze the story's emotional content (or fallback analysis if API unavailable)
6. Based on the analysis, the system generates a personalized compliment
7. The compliment is sent back to the frontend for display

## Compliment Modes

- **Hype Mode 🔥**: Strong motivational compliments for achievements
- **Soft Care Mode 🤍**: Warm, emotional compliments for sensitive stories
- **Best Friend Mode 🧸**: Friendly, casual compliments
- **Deep Soul Mode 🌙**: Thoughtful, introspective compliments
- **Auto Mode 🤖**: Automatically selects the best mode based on story analysis

## Media Features

Users can now upload photos and videos along with their stories:
- Photos and videos are stored for 24 hours
- Media content is analyzed and described
- Descriptions are incorporated into the story analysis
- Users can view their recent media through the API

## Fallback Functionality

If the Gemini API is unavailable or not configured, the system automatically falls back to a heuristic-based analysis engine that:

- Detects emotions based on keywords in the story
- Estimates confidence levels based on punctuation and language
- Determines story intent from context clues
- Classifies writing style based on text characteristics

This ensures the application remains functional even without API access.

## Troubleshooting

If you encounter issues with the Gemini API:

1. Check that your API key is valid and properly configured in the `.env` file
2. Verify that you have enabled the Generative Language API in the Google Cloud Console
3. The default model is `gemini-pro`, but depending on your API access, you may need to change this in `server.js`
4. If you get model not found errors, try these alternatives:
   - `gemini-1.0-pro`
   - `gemini-1.5-pro-latest`
   - `gemini-1.5-flash-latest`

To test which models work with your API key, you can create a simple test script or check the Google Cloud Console for available models.

Even if the API doesn't work, the application will function using the built-in fallback analysis.