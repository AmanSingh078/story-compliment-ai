// Vercel serverless function for generating compliments with Gemini AI
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
    // Get the request data
    const { story, mode, language, media } = req.body;
    
    if (!story) {
      return res.status(400).json({ error: 'Story content is required' });
    }
    
    // Initialize Google Generative AI with API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // First, analyze the story content
    const analysis = await analyzeStoryContent(genAI, story, media);
    
    // Determine the compliment mode
    const complimentMode = mode === 'auto' ? determineMode(analysis) : mode;
    
    // Determine the language (force hindlish as requested)
    const complimentLanguage = language || 'hindlish';
    
    // Generate the compliment using Gemini
    const compliment = await generateCompliment(genAI, analysis, complimentMode, complimentLanguage, story);
    
    res.status(200).json({
      compliment: compliment,
      mode: complimentMode,
      language: complimentLanguage,
      analysis: analysis
    });
  } catch (error) {
    console.error('Error processing compliment:', error);
    res.status(500).json({ error: 'Failed to generate compliment: ' + error.message });
  }
};

// Function to analyze story content using Gemini
async function analyzeStoryContent(genAI, story, media) {
  try {
    let model;
    let prompt;
    
    // Use Gemini Pro Vision if media is provided
    if (media) {
      model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
      
      prompt = {
        parts: [
          {
            text: `Analyze this story content and the attached media to provide:
            1. A brief description of what you see (20 words max)
            2. The dominant emotion expressed
            3. The likely gender of the person (if identifiable) - options: Male, Female, Group, or Not Identifiable
            4. Content category - options: Person, Nature, Object, or Mixed
            5. Preferred language for compliments (english, hindi, or hindlish)
            
            Story: ${story}
            
            Base your analysis on both the story content and media patterns. Be specific about gender and content type.`
          },
          {
            inlineData: {
              data: media.data,
              mimeType: media.type
            }
          }
        ]
      };
    } else {
      // Use Gemini Pro for text-only analysis
      model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      prompt = `Analyze this story content and provide:
      1. A brief description of what you see (20 words max)
      2. The dominant emotion expressed
      3. The likely gender of the person (if identifiable) - options: Male, Female, Group, or Not Identifiable
      4. Content category - options: Person, Nature, Object, or Mixed
      5. Preferred language for compliments (english, hindi, or hindlish)
      
      Story: ${story}
      
      Base your analysis on the story content patterns. Be specific about gender and content type.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the analysis response
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const analysis = {
      description: lines[0] ? lines[0].replace(/^\d+\.\s*/, '') : "User sharing personal thoughts or experiences",
      emotion: lines[1] ? lines[1].replace(/^\d+\.\s*/, '') : "Neutral",
      gender: lines[2] ? lines[2].replace(/^\d+\.\s*/, '') : "Not Identifiable",
      contentCategory: lines[3] ? lines[3].replace(/^\d+\.\s*/, '') : "Mixed",
      languagePreference: "hindlish" // Force hindlish as requested
    };
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing story content:', error);
    // Return default analysis if AI fails
    return {
      description: "User sharing personal thoughts or experiences",
      emotion: "Joy",
      gender: "Not Identifiable",
      contentCategory: "Mixed",
      languagePreference: "hindlish"
    };
  }
}

// Function to determine compliment mode based on analysis
function determineMode(analysis) {
  const emotion = analysis.emotion.toLowerCase();
  
  if (emotion.includes('excite') || emotion.includes('happy') || emotion.includes('joy') || emotion.includes('success')) {
    return 'hype';
  } else if (emotion.includes('sad') || emotion.includes('lonely') || emotion.includes('thoughtful')) {
    return 'care';
  } else if (emotion.includes('friend') || emotion.includes('fun')) {
    return 'friend';
  } else if (emotion.includes('deep') || emotion.includes('reflect')) {
    return 'soul';
  } else {
    // Default to friend mode for neutral emotions
    return 'friend';
  }
}

// Function to generate compliment using Gemini
async function generateCompliment(genAI, analysis, mode, language, story) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Define mode descriptions
    const modeDescriptions = {
      hype: "Create an enthusiastic, motivational compliment that celebrates achievements and positive energy",
      care: "Create a warm, empathetic compliment that provides emotional support and comfort",
      friend: "Create a friendly, casual compliment that feels like it's from a close friend",
      soul: "Create a thoughtful, introspective compliment that reflects depth and meaning"
    };
    
    // Define language instructions
    const languageInstructions = {
      english: "in English",
      hindi: "in Hindi",
      hindlish: "in Hindlish (a natural mix of Hindi and English that feels conversational and culturally relatable)"
    };
    
    // Customize prompt based on media analysis
    let contentSpecificPrompt = "";
    if (analysis.contentCategory) {
      if (analysis.contentCategory.includes('Person') || analysis.contentCategory.includes('person')) {
        if (analysis.gender.includes('Male') || analysis.gender.includes('male')) {
          contentSpecificPrompt = "The content features a male subject. ";
        } else if (analysis.gender.includes('Female') || analysis.gender.includes('female')) {
          contentSpecificPrompt = "The content features a female subject. ";
        } else if (analysis.gender.includes('Group') || analysis.gender.includes('group')) {
          contentSpecificPrompt = "The content features a group of people. ";
        }
      } else if (analysis.contentCategory.includes('Nature') || analysis.contentCategory.includes('nature')) {
        contentSpecificPrompt = "The content features nature or outdoor scenes. ";
      } else if (analysis.contentCategory.includes('Object') || analysis.contentCategory.includes('object')) {
        contentSpecificPrompt = "The content features objects or items. ";
      }
    }
    
    const prompt = `You are a one-sided lover figure who gives personalized compliments. 
    Your task is to create a short, personalized compliment based on:
    
    Story: ${story}
    Emotion: ${analysis.emotion}
    ${contentSpecificPrompt}
    
    Mode: ${mode} - ${modeDescriptions[mode]}
    
    Language: ${language} - ${languageInstructions[language]}
    
    Make it Instagram story friendly, casual, and uplifting. Keep it under 20 words.
    The compliment should feel personal and emotionally engaging, like it's from a one-sided lover.
    Use Hindlish when requested to make it more relatable and culturally contextual.
    
    For different content types, adjust your approach:
    - For people: Focus on their expression, style, or personality
    - For nature: Appreciate the beauty or serenity
    - For objects: Comment on aesthetics or significance
    - For groups: Acknowledge togetherness or shared moments`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating compliment:', error);
    // Fallback compliment in hindlish
    const fallbackCompliments = [
      "Tumhara story dekh ke mujhe khushi mili! Tumhari positivity contagious hai yaar 😊",
      "Wow, tumne kya ache se enjoy kiya apna moment! Tumhara enthusiasm visible hai 💫",
      "Tumhare expressions mein jo energy hai na, woh inspire kar rahi hai! Keep shining 🌟"
    ];
    
    return fallbackCompliments[Math.floor(Math.random() * fallbackCompliments.length)];
  }
}