// Vercel serverless function for generating compliments
const { GoogleGenerativeAI } = require('@google/generative-ai');

// This is a Vercel serverless function
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }
  
  try {
    // Get the analysis data from the request body
    const { analysis } = req.body;
    
    if (!analysis) {
      return res.status(400).json({ error: 'No analysis data provided' });
    }
    
    // Force hindlish as requested
    analysis.languagePreference = 'hindlish';
    
    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Create a short, personalized compliment in ${analysis.languagePreference} based on:
    - Description: ${analysis.description}
    - Emotion: ${analysis.emotion}
    - Gender: ${analysis.genderLikelihood}
    
    Make it Instagram story friendly, casual, and uplifting. Keep it under 15 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const compliment = response.text();
    
    res.status(200).json({
      compliment: compliment,
      analysis: analysis
    });
  } catch (error) {
    console.error('Error processing compliment:', error);
    res.status(500).json({ error: 'Failed to generate compliment: ' + error.message });
  }
};