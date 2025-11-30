const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to analyze story content using Gemini
async function analyzeStoryContent(mediaPath, isVideo = false) {
  try {
    // For demonstration, we'll simulate analysis
    // In a real implementation, you would process the actual media file
    const prompt = `Analyze this story content and provide:
    1. A brief description of what you see (20 words max)
    2. The dominant emotion expressed
    3. The likely gender of the person (if identifiable)
    4. Preferred language for compliments (english, hindi, or hindlish)
    
    Base your analysis on typical story content patterns.`;

    // Simulated analysis result
    const simulatedAnalysis = {
      description: "User sharing a personal achievement or happy moment",
      emotion: "Joy",
      genderLikelihood: "Neutral",
      languagePreference: "hindlish"
    };

    return simulatedAnalysis;
  } catch (error) {
    console.error('Error analyzing story content:', error);
    throw error;
  }
}

// Function to generate compliment using Gemini
async function generateCompliment(analysis) {
  try {
    // Force hindlish as requested
    analysis.languagePreference = 'hindlish';
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Create a short, personalized compliment in ${analysis.languagePreference} based on:
    - Description: ${analysis.description}
    - Emotion: ${analysis.emotion}
    - Gender: ${analysis.genderLikelihood}
    
    Make it Instagram story friendly, casual, and uplifting. Keep it under 15 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating compliment:', error);
    throw error;
  }
}

// API endpoint to process story and generate compliment
app.post('/api/compliment', upload.single('story'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No story file uploaded' });
    }

    const isVideo = req.file.mimetype.startsWith('video');
    const analysis = await analyzeStoryContent(req.file.path, isVideo);
    const compliment = await generateCompliment(analysis);

    res.json({
      compliment: compliment,
      analysis: analysis
    });
  } catch (error) {
    console.error('Error processing story:', error);
    res.status(500).json({ error: 'Failed to process story and generate compliment' });
  }
});

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
}

// Export for Vercel
module.exports = app;

// Only listen locally
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}