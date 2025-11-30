const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Import the fallback function from server.js for testing
const fs = require('fs');
const path = require('path');

// Simple implementation of fallback function for testing
function fallbackAnalyzeStory(storyText) {
  console.log('Using fallback analysis due to API unavailability');
  
  // Simple heuristic-based analysis
  const lowerStory = storyText.toLowerCase();
  
  // Detect emotions based on keywords
  let emotionLevel = 'neutral';
  if (lowerStory.includes('happy') || lowerStory.includes('joy') || lowerStory.includes('excited') || lowerStory.includes('great')) {
    emotionLevel = 'happy';
  } else if (lowerStory.includes('sad') || lowerStory.includes('upset') || lowerStory.includes('disappointed')) {
    emotionLevel = 'sad';
  } else if (lowerStory.includes('proud') || lowerStory.includes('accomplished') || lowerStory.includes('success')) {
    emotionLevel = 'proud';
  } else if (lowerStory.includes('stressed') || lowerStory.includes('worried') || lowerStory.includes('anxious')) {
    emotionLevel = 'stressed';
  }
  
  // Estimate confidence based on exclamation marks and positive language
  const exclamationCount = (storyText.match(/!/g) || []).length;
  const confidenceLevel = Math.min(10, 5 + exclamationCount + (emotionLevel === 'proud' ? 2 : 0));
  
  // Determine intent based on keywords
  let storyIntent = 'general';
  if (lowerStory.includes('achieve') || lowerStory.includes('finish') || lowerStory.includes('complete') || lowerStory.includes('win')) {
    storyIntent = 'achievement';
  } else if (lowerStory.includes('learn') || lowerStory.includes('grow') || lowerStory.includes('improve')) {
    storyIntent = 'self-growth';
  } else if (lowerStory.includes('create') || lowerStory.includes('make') || lowerStory.includes('build')) {
    storyIntent = 'creativity';
  } else if (lowerStory.includes('pain') || lowerStory.includes('hurt') || lowerStory.includes('struggle')) {
    storyIntent = 'pain';
  }
  
  // Determine writing style based on characteristics
  let writingStyle = 'casual';
  const sentenceCount = storyText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgSentenceLength = storyText.length / sentenceCount;
  
  if (avgSentenceLength > 50) {
    writingStyle = 'serious';
  } else if (lowerStory.includes('lol') || lowerStory.includes('haha') || lowerStory.includes('funny')) {
    writingStyle = 'funny';
  } else if (storyText.includes('\n') && storyText.includes('  ')) {
    writingStyle = 'poetic';
  }
  
  return {
    emotionLevel,
    confidenceLevel,
    storyIntent,
    writingStyle
  };
}

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  try {
    // Using gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      Analyze the following story and extract these elements:
      
      1. Emotion Level: Identify the primary emotions (happy, sad, proud, stressed, etc.)
      2. Confidence Level: Rate the author's confidence from 1-10
      3. Story Intent: Determine the purpose (achievement, pain, self-growth, creativity, etc.)
      4. Writing Style: Classify the style (funny, poetic, casual, serious, etc.)
      
      Story: "Today I finished my first marathon! It was challenging but I never gave up. The feeling of crossing the finish line was incredible!"
      
      Provide your response in JSON format with these keys:
      {
        "emotionLevel": "...",
        "confidenceLevel": 0,
        "storyIntent": "...",
        "writingStyle": "..."
      }
    `;
    
    console.log("Sending request to Gemini API...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Raw response from Gemini:");
    console.log(text);
    
    // Clean up the response to extract JSON
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    
    console.log("Extracted JSON:");
    console.log(jsonString);
    
    const jsonData = JSON.parse(jsonString);
    console.log("Parsed JSON:");
    console.log(jsonData);
  } catch (error) {
    console.log('Error with Gemini API:', error.message);
    console.log('Testing fallback analysis instead...');
    
    // Test fallback analysis
    const story = "Today I finished my first marathon! It was challenging but I never gave up. The feeling of crossing the finish line was incredible!";
    const fallbackResult = fallbackAnalyzeStory(story);
    console.log("Fallback analysis result:");
    console.log(fallbackResult);
  }
}

testGemini();