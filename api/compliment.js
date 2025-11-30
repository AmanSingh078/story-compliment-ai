const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
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
    const { analysis } = req.body;
    
    if (!analysis) {
      return res.status(400).json({ error: 'No analysis data provided' });
    }
    
    const compliment = await generateCompliment(analysis);
    
    res.status(200).json({
      compliment: compliment,
      analysis: analysis
    });
  } catch (error) {
    console.error('Error processing compliment:', error);
    res.status(500).json({ error: 'Failed to generate compliment' });
  }
};