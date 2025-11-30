const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase payload limit for images
app.use(express.urlencoded({ extended: true }));

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// In-memory storage for user media (in production, use a database)
const userMediaStorage = new Map();

// Enhanced fallback story analysis with more sophisticated heuristics
function fallbackAnalyzeStory(storyText) {
  console.log('Using enhanced fallback analysis due to API unavailability');
  
  // Simple heuristic-based analysis
  const lowerStory = storyText.toLowerCase();
  
  // Enhanced emotion detection with intensity scoring
  let emotionLevel = 'neutral';
  let emotionIntensity = 5; // Default neutral intensity
  
  // Positive emotions
  const happyWords = ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'awesome', 'खुश', 'आनंद', 'उत्साहित', 'अद्भुत', 'शानदार', 'thrilled', 'delighted', 'ecstatic', 'cheerful', 'glad'];
  const proudWords = ['proud', 'accomplished', 'success', 'achievement', 'गर्व', 'सफल', 'उपलब्धि', 'विजय', 'जीत', 'triumph', 'victory', 'conquered', 'mastered'];
  const gratefulWords = ['grateful', 'thankful', 'blessed', 'fortunate', 'privileged', 'धन्यवाद', 'आभारी', 'धन्य'];
  
  // Negative emotions
  const sadWords = ['sad', 'upset', 'disappointed', 'depressed', 'उदास', 'परेशान', 'निराश', 'दुखी', 'heartbroken', 'miserable', 'gloomy', 'melancholy'];
  const stressedWords = ['stressed', 'worried', 'anxious', 'tensed', 'तनाव', 'चिंतित', 'बेचैन', 'चिड़चिड़ापन', 'overwhelmed', 'panicked', 'nervous', 'frustrated'];
  const angryWords = ['angry', 'mad', 'furious', 'irate', 'enraged', 'annoyed', 'irritated', 'गुस्सा', 'क्रोध', 'नाराज़'];
  
  // Neutral/Complex emotions
  const nostalgicWords = ['nostalgic', 'memories', 'memory', 'childhood', 'past', 'यादें', 'बचपन', 'अतीत'];
  const curiousWords = ['curious', 'wonder', 'explore', 'discover', 'intrigued', 'उत्सुक', 'जिज्ञासु', 'अन्वेषण'];
  
  // Count emotion words
  const happyCount = happyWords.reduce((count, word) => count + (lowerStory.match(new RegExp(word, 'g')) || []).length, 0);
  const proudCount = proudWords.reduce((count, word) => count + (lowerStory.match(new RegExp(word, 'g')) || []).length, 0);
  const gratefulCount = gratefulWords.reduce((count, word) => count + (lowerStory.match(new RegExp(word, 'g')) || []).length, 0);
  const sadCount = sadWords.reduce((count, word) => count + (lowerStory.match(new RegExp(word, 'g')) || []).length, 0);
  const stressedCount = stressedWords.reduce((count, word) => count + (lowerStory.match(new RegExp(word, 'g')) || []).length, 0);
  const angryCount = angryWords.reduce((count, word) => count + (lowerStory.match(new RegExp(word, 'g')) || []).length, 0);
  const nostalgicCount = nostalgicWords.reduce((count, word) => count + (lowerStory.match(new RegExp(word, 'g')) || []).length, 0);
  const curiousCount = curiousWords.reduce((count, word) => count + (lowerStory.match(new RegExp(word, 'g')) || []).length, 0);
  
  // Determine dominant emotion
  const emotionCounts = [
    { emotion: 'happy', count: happyCount },
    { emotion: 'proud', count: proudCount },
    { emotion: 'grateful', count: gratefulCount },
    { emotion: 'sad', count: sadCount },
    { emotion: 'stressed', count: stressedCount },
    { emotion: 'angry', count: angryCount },
    { emotion: 'nostalgic', count: nostalgicCount },
    { emotion: 'curious', count: curiousCount }
  ];
  
  const dominantEmotion = emotionCounts.reduce((max, current) => 
    current.count > max.count ? current : max, { emotion: 'neutral', count: 0 });
  
  if (dominantEmotion.count > 0) {
    emotionLevel = dominantEmotion.emotion;
    emotionIntensity = Math.min(10, 3 + dominantEmotion.count * 2);
  }
  
  // Estimate confidence based on linguistic markers
  const exclamationCount = (storyText.match(/!/g) || []).length;
  const questionCount = (storyText.match(/\?/g) || []).length;
  const positiveMarkers = (lowerStory.match(/\b(i can|able to|successfully|achieved|completed|mastered|conquered)\b/g) || []).length;
  const negativeMarkers = (lowerStory.match(/\b(i can't|unable to|failed|couldn't|struggling)\b/g) || []).length;
  const certaintyMarkers = (lowerStory.match(/\b(definitely|absolutely|certainly|undoubtedly)\b/g) || []).length;
  const uncertaintyMarkers = (lowerStory.match(/\b(maybe|perhaps|possibly|unsure)\b/g) || []).length;
  
  // Confidence calculation with more factors
  let confidenceLevel = Math.min(10, 5 + 
    exclamationCount * 1.5 + 
    positiveMarkers * 2 + 
    certaintyMarkers * 1.5 -
    negativeMarkers * 1.5 - 
    questionCount * 0.5 -
    uncertaintyMarkers * 1);
  
  confidenceLevel = Math.max(1, Math.round(confidenceLevel));
  
  // Determine intent with more categories
  let storyIntent = 'general';
  
  // Achievement oriented
  if (lowerStory.includes('achieve') || lowerStory.includes('finish') || lowerStory.includes('complete') || lowerStory.includes('win') ||
      lowerStory.includes('प्राप्त') || lowerStory.includes('समाप्त') || lowerStory.includes('जीत') ||
      lowerStory.includes('succeed') || lowerStory.includes('accomplish') || lowerStory.includes('reach') ||
      lowerStory.includes('master') || lowerStory.includes('conquer') || lowerStory.includes('triumph')) {
    storyIntent = 'achievement';
  } 
  // Growth and learning
  else if (lowerStory.includes('learn') || lowerStory.includes('grow') || lowerStory.includes('improve') ||
           lowerStory.includes('सीख') || lowerStory.includes('विकसित') || lowerStory.includes('बेहतर') ||
           lowerStory.includes('develop') || lowerStory.includes('understand') || lowerStory.includes('realize') ||
           lowerStory.includes('study') || lowerStory.includes('practice') || lowerStory.includes('skill')) {
    storyIntent = 'self-growth';
  } 
  // Creative expression
  else if (lowerStory.includes('create') || lowerStory.includes('make') || lowerStory.includes('build') ||
           lowerStory.includes('रच') || lowerStory.includes('बना') || lowerStory.includes('निर्माण') ||
           lowerStory.includes('design') || lowerStory.includes('compose') || lowerStory.includes('write') ||
           lowerStory.includes('art') || lowerStory.includes('paint') || lowerStory.includes('draw') ||
           lowerStory.includes('music') || lowerStory.includes('sing') || lowerStory.includes('dance')) {
    storyIntent = 'creativity';
  } 
  // Challenges and struggles
  else if (lowerStory.includes('pain') || lowerStory.includes('hurt') || lowerStory.includes('struggle') ||
           lowerStory.includes('दर्द') || lowerStory.includes('चोट') || lowerStory.includes('संघर्ष') ||
           lowerStory.includes('fight') || lowerStory.includes('battle') || lowerStory.includes('challenge') ||
           lowerStory.includes('difficult') || lowerStory.includes('hard') || lowerStory.includes('tough')) {
    storyIntent = 'pain';
  }
  // Reflection and contemplation
  else if (lowerStory.includes('think') || lowerStory.includes('reflect') || lowerStory.includes('contemplate') ||
           lowerStory.includes('ponder') || lowerStory.includes('meditate') || lowerStory.includes('soch') ||
           lowerStory.includes('विचार') || lowerStory.includes('चिंतन') ||
           lowerStory.includes('wonder') || lowerStory.includes('question') || lowerStory.includes('philosophy')) {
    storyIntent = 'reflection';
  }
  // Celebration and joy
  else if (lowerStory.includes('celebrate') || lowerStory.includes('party') || lowerStory.includes('festive') ||
           lowerStory.includes('birthday') || lowerStory.includes('anniversary') || lowerStory.includes('milestone')) {
    storyIntent = 'celebration';
  }
  // Helping others
  else if (lowerStory.includes('help') || lowerStory.includes('assist') || lowerStory.includes('support') ||
           lowerStory.includes('volunteer') || lowerStory.includes('kind') || lowerStory.includes('generous')) {
    storyIntent = 'service';
  }
  
  // Determine writing style based on characteristics
  let writingStyle = 'casual';
  const sentenceCount = storyText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgSentenceLength = sentenceCount > 0 ? storyText.length / sentenceCount : 0;
  
  // Vocabulary richness analysis
  const words = storyText.split(/\s+/);
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-zA-Z\u0900-\u097F]/g, ''))).size;
  const vocabularyRichness = words.length > 0 ? uniqueWords / words.length : 0;
  
  if (avgSentenceLength > 50 && vocabularyRichness > 0.6) {
    writingStyle = 'serious';
  } else if (lowerStory.includes('lol') || lowerStory.includes('haha') || lowerStory.includes('funny') ||
             lowerStory.includes('लोल') || lowerStory.includes('हाहा') || lowerStory.includes('मजेदार') ||
             lowerStory.includes('laugh') || lowerStory.includes('humor') || lowerStory.includes('joke') ||
             lowerStory.includes('hilarious') || lowerStory.includes('comedy')) {
    writingStyle = 'funny';
  } else if ((storyText.includes('\n') && storyText.includes('  ')) || vocabularyRichness > 0.7) {
    writingStyle = 'poetic';
  } else if (vocabularyRichness > 0.5) {
    writingStyle = 'thoughtful';
  } else if (lowerStory.includes('dramatic') || lowerStory.includes('intense') || lowerStory.includes('passionate')) {
    writingStyle = 'dramatic';
  }
  
  // Determine temporal context
  let temporalContext = 'present';
  if (lowerStory.includes('yesterday') || lowerStory.includes('last week') || lowerStory.includes('ago') ||
      lowerStory.includes('before') || lowerStory.includes('earlier')) {
    temporalContext = 'past';
  } else if (lowerStory.includes('tomorrow') || lowerStory.includes('next week') || lowerStory.includes('future') ||
             lowerStory.includes('soon') || lowerStory.includes('later')) {
    temporalContext = 'future';
  }
  
  // Determine narrative perspective
  let narrativePerspective = 'first person';
  if (lowerStory.includes('he ') || lowerStory.includes('she ') || lowerStory.includes('they ') ||
      lowerStory.includes('him ') || lowerStory.includes('her ') || lowerStory.includes('them ')) {
    narrativePerspective = 'third person';
  }
  
  // Personality traits inference with more nuance
  const personalityTraits = [];
  
  // Confidence indicators
  if (confidenceLevel > 7) personalityTraits.push('confident');
  if (certaintyMarkers > 2) personalityTraits.push('decisive');
  if (positiveMarkers > 3) personalityTraits.push('optimistic');
  
  // Emotional traits
  if (emotionLevel === 'happy' && emotionIntensity > 7) personalityTraits.push('joyful');
  if (emotionLevel === 'grateful') personalityTraits.push('grateful');
  if (emotionLevel === 'curious') personalityTraits.push('curious');
  if (emotionLevel === 'nostalgic') personalityTraits.push('reflective');
  if (storyIntent === 'self-growth' || storyIntent === 'reflection') personalityTraits.push('introspective');
  if (emotionLevel === 'sad' || emotionLevel === 'stressed') personalityTraits.push('empathetic');
  if (emotionLevel === 'angry' && emotionIntensity > 6) personalityTraits.push('passionate');
  
  // Behavioral traits
  if (storyIntent === 'creativity') personalityTraits.push('creative');
  if (storyIntent === 'service') personalityTraits.push('compassionate');
  if (storyIntent === 'achievement') personalityTraits.push('ambitious');
  if (writingStyle === 'poetic' || writingStyle === 'serious') personalityTraits.push('thoughtful');
  if (lowerStory.includes('help') || lowerStory.includes('support')) personalityTraits.push('helpful');
  
  // Intellectual traits
  if (vocabularyRichness > 0.6) personalityTraits.push('articulate');
  if (storyIntent === 'reflection' || storyIntent === 'self-growth') personalityTraits.push('intellectual');
  if (curiousCount > 1) personalityTraits.push('inquisitive');
  
  // Ensure at least two traits
  if (personalityTraits.length === 0) personalityTraits.push('balanced', 'thoughtful');
  if (personalityTraits.length === 1) personalityTraits.push('genuine');
  
  // Determine tone
  let tone = 'neutral';
  if (emotionLevel === 'happy' && confidenceLevel > 7) tone = 'celebratory';
  else if (emotionLevel === 'happy') tone = 'encouraging';
  else if (emotionLevel === 'proud') tone = 'proud';
  else if (emotionLevel === 'grateful') tone = 'thankful';
  else if (emotionLevel === 'sad') tone = 'melancholic';
  else if (emotionLevel === 'stressed') tone = 'concerned';
  else if (emotionLevel === 'angry') tone = 'intense';
  else if (emotionLevel === 'nostalgic') tone = 'reflective';
  else if (emotionLevel === 'curious') tone = 'inquiring';
  else if (writingStyle === 'thoughtful' || writingStyle === 'poetic') tone = 'contemplative';
  else if (writingStyle === 'funny') tone = 'playful';
  else if (confidenceLevel > 8) tone = 'confident';
  
  // Determine key themes
  const keyThemes = [];
  if (storyIntent === 'achievement' || storyIntent === 'self-growth') keyThemes.push('personal development');
  if (storyIntent === 'creativity') keyThemes.push('artistic expression');
  if (storyIntent === 'service') keyThemes.push('community');
  if (storyIntent === 'pain') keyThemes.push('resilience');
  if (storyIntent === 'reflection') keyThemes.push('self-awareness');
  if (emotionLevel === 'grateful') keyThemes.push('appreciation');
  if (emotionLevel === 'curious') keyThemes.push('exploration');
  if (emotionLevel === 'nostalgic') keyThemes.push('memory');
  
  // Ensure at least one theme
  if (keyThemes.length === 0) keyThemes.push('life experience');
  
  // Cultural context detection
  let culturalContext = 'general';
  if (lowerStory.includes('diwali') || lowerStory.includes('holi') || lowerStory.includes('eid') ||
      lowerStory.includes('navratri') || lowerStory.includes('dussehra')) {
    culturalContext = 'Indian festivals';
  } else if (lowerStory.includes('christmas') || lowerStory.includes('thanksgiving') || lowerStory.includes('halloween')) {
    culturalContext = 'Western holidays';
  } else if (lowerStory.includes('lunar new year') || lowerStory.includes('chinese new year')) {
    culturalContext = 'East Asian celebrations';
  }
  
  return {
    emotionLevel,
    emotionIntensity,
    confidenceLevel,
    storyIntent,
    writingStyle,
    personalityTraits,
    tone,
    keyThemes,
    narrativePerspective,
    temporalContext,
    culturalContext
  };
}

// Enhanced Story Intelligence Engine with advanced analysis - 100% AI powered
async function analyzeStory(storyText) {
  try {
    // Using the most advanced gemini-2.0-flash-exp model for maximum AI capability
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = `
      You are an expert psychologist, linguist, and storyteller. Perform an in-depth analysis of the following story with maximum precision and insight. Extract these elements with detailed insights:
      
      1. Primary Emotion: Identify the dominant emotion (happy, sad, proud, stressed, excited, calm, angry, anxious, grateful, nostalgic, etc.)
      2. Emotion Intensity: Rate the emotional intensity from 1-10 with detailed reasoning
      3. Confidence Level: Rate the author's confidence from 1-10 based on language choices, expressions, and self-perception
      4. Story Intent: Determine the purpose (achievement, pain, self-growth, creativity, reflection, challenge, celebration, etc.)
      5. Writing Style: Classify the style (funny, poetic, casual, serious, thoughtful, dramatic, etc.)
      6. Language Preference: Detect the dominant language (english, hindi, hindlish)
      7. Personality Traits: Infer 3-5 personality traits based on the writing (confident, creative, empathetic, optimistic, introspective, resilient, curious, etc.)
      8. Tone: Describe the overall tone (encouraging, melancholic, celebratory, contemplative, inspirational, etc.)
      9. Key Themes: Identify 2-3 key themes (resilience, creativity, growth, relationships, ambition, etc.)
      10. Narrative Perspective: Identify the narrative perspective (first person, third person, etc.)
      11. Temporal Context: Identify the time context (past, present, future)
      12. Cultural Context: Identify any cultural references or context
      
      Story: "${storyText}"
      
      Provide your response in detailed JSON format with these keys:
      {
        "emotionLevel": "...",
        "emotionIntensity": 0,
        "confidenceLevel": 0,
        "storyIntent": "...",
        "writingStyle": "...",
        "languagePreference": "...",
        "personalityTraits": ["...", "...", "..."],
        "tone": "...",
        "keyThemes": ["...", "..."],
        "narrativePerspective": "...",
        "temporalContext": "...",
        "culturalContext": "..."
      }
      
      Make sure all numerical values are actual numbers, not strings. Ensure the response is valid JSON.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response to extract JSON
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    
    const analysis = JSON.parse(jsonString);
    
    // Force hindlish for more natural human-like behavior regardless of detection
    analysis.languagePreference = 'hindlish';
    
    // Ensure personalityTraits is always an array
    if (!Array.isArray(analysis.personalityTraits)) {
      analysis.personalityTraits = ['balanced'];
    }
    
    // Ensure keyThemes is always an array
    if (!Array.isArray(analysis.keyThemes)) {
      analysis.keyThemes = ['life'];
    }
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing story with Gemini API:', error.message);
    console.log('Falling back to enhanced heuristic analysis');
    // Use fallback analysis when API fails
    const fallbackResult = fallbackAnalyzeStory(storyText);
    // Force hindlish for more natural human-like behavior
    fallbackResult.languagePreference = 'hindlish';
    return fallbackResult;
  }
}

// Advanced language detection function
function detectLanguage(text) {
  // Count Hindi characters
  const hindiCharRegex = /[\u0900-\u097F]/g;
  const hindiChars = text.match(hindiCharRegex) || [];
  
  // Count English characters
  const englishCharRegex = /[a-zA-Z]/g;
  const englishChars = text.match(englishCharRegex) || [];
  
  // Count numeric characters
  const numericRegex = /[0-9]/g;
  const numericChars = text.match(numericRegex) || [];
  
  // Calculate percentages
  const totalChars = text.length;
  const hindiPercentage = (hindiChars.length / totalChars) * 100;
  const englishPercentage = (englishChars.length / totalChars) * 100;
  
  // Determine language preference based on character frequency
  if (hindiPercentage > 30) {
    // If Hindi characters are more than 30% of total characters, prefer Hindi
    return 'hindi';
  } else if (hindiPercentage > 5 && englishPercentage > 20) {
    // If there's a mix of Hindi and English characters, use Hindlish
    return 'hindlish';
  } else if (englishPercentage > 10) {
    // If mostly English, use English
    return 'english';
  } else {
    // Default to English for ambiguous cases
    return 'english';
  }
}

// Enhanced Media analysis using Gemini AI with comprehensive content detection
async function analyzeMedia(mediaData, mediaType) {
  try {
    // Using the most advanced gemini-2.0-flash-exp model for image analysis
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    // Convert base64 to image buffer
    const imageBuffer = Buffer.from(mediaData, 'base64');
    
    const prompt = `Perform a comprehensive analysis of this ${mediaType}. Provide detailed information about what you see with these specific elements:
      
      1. Main Subjects: Detailed description of primary subjects (people with estimated ages, animals, objects, landscapes)
      2. Gender Distribution: If people are present, specify distribution (male, female, mixed group, or none)
      3. People Count: Number of people (individual, small group 2-4, large group 5+, or none)
      4. Setting/Environment: Detailed setting (indoor, outdoor, nature, urban, beach, mountains, etc.)
      5. Activities/Events: Specific actions or events taking place
      6. Overall Mood/Atmosphere: Emotional tone (joyful, serene, energetic, contemplative, etc.)
      7. Visual Elements: Notable aspects (colors, lighting, composition, style, quality)
      8. Estimated Time of Day: If determinable (morning, afternoon, evening, night)
      9. Cultural Context: Any cultural or regional indicators
      10. Quality Assessment: Image quality assessment (clear, blurry, well-lit, etc.)
      11. Prominent Colors: Identify 3-5 prominent colors
      12. Facial Expressions: If faces are visible, describe expressions
      13. Notable Objects: List any notable objects or items
      14. Weather Conditions: If determinable (sunny, cloudy, rainy, etc.)
      
      Structure your response as a detailed JSON object with these keys:
      {
        "subjects": "detailed description of main subjects with specifics",
        "gender": "male|female|mixed|none",
        "peopleCount": "individual|smallGroup|largeGroup|none",
        "setting": "indoor|outdoor|nature|urban|beach|mountains|other",
        "activities": "specific activities or events described in detail",
        "mood": "overall emotional atmosphere",
        "elements": "notable visual elements including colors and lighting",
        "timeOfDay": "morning|afternoon|evening|night|unknown",
        "culturalContext": "cultural or regional indicators if any",
        "quality": "image quality assessment",
        "colors": ["color1", "color2", "color3"],
        "expressions": "facial expressions if visible",
        "objects": ["object1", "object2"],
        "weather": "sunny|cloudy|rainy|snowy|unknown"
      }
      
      If you cannot determine specific details, use "unknown" as the value. Ensure the response is valid JSON.`;
    
    const imagePart = {
      inlineData: {
        data: mediaData,
        mimeType: mediaType.startsWith('video') ? 'video/mp4' : 'image/jpeg'
      }
    };
    
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from response
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonString = text.substring(jsonStart, jsonEnd);
      const analysis = JSON.parse(jsonString);
      
      // Add media type info
      analysis.mediaType = mediaType;
      return analysis;
    } catch (parseError) {
      // If JSON parsing fails, return a structured fallback
      console.log('Enhanced media analysis JSON parsing failed, using fallback format');
      return {
        subjects: text,
        gender: "unknown",
        peopleCount: "unknown",
        setting: "unknown",
        activities: "unknown",
        mood: "unknown",
        elements: "unknown",
        timeOfDay: "unknown",
        culturalContext: "unknown",
        quality: "unknown",
        colors: ["unknown"],
        expressions: "unknown",
        objects: ["unknown"],
        weather: "unknown",
        mediaType: mediaType
      };
    }
  } catch (error) {
    console.error('Error analyzing media with Gemini API:', error.message);
    // Enhanced fallback description
    return {
      subjects: `A ${mediaType} shared by the user`,
      gender: "unknown",
      peopleCount: "unknown",
      setting: "unknown",
      activities: mediaType.includes('video') ? 'Video content' : 'Image content',
      mood: "captures a moment from their day",
      elements: "unknown",
      timeOfDay: "unknown",
      culturalContext: "unknown",
      quality: "unknown",
      colors: ["unknown"],
      expressions: "unknown",
      objects: ["unknown"],
      weather: "unknown",
      mediaType: mediaType
    };
  }
}

// Enhanced compliment generation with more variety and multilingual support
function generateCompliment(analysis, mode = 'default', mediaAnalysis = null) {
  // Extract all available analysis data
  const { 
    emotionLevel, 
    emotionIntensity, 
    confidenceLevel, 
    storyIntent, 
    writingStyle, 
    languagePreference,
    personalityTraits,
    tone,
    keyThemes,
    narrativePerspective,
    temporalContext,
    culturalContext
  } = analysis;
  
  // If we have media analysis, use it to customize compliments
  let mediaContext = '';
  let mediaDetails = {};
  if (mediaAnalysis) {
    const { gender, peopleCount, setting, subjects, mood, timeOfDay, quality, colors, expressions, objects, weather } = mediaAnalysis;
    mediaDetails = { gender, peopleCount, setting, subjects, mood, timeOfDay, quality, colors, expressions, objects, weather };
    
    // Create context based on media content
    if (gender === 'male') {
      mediaContext = 'male';
    } else if (gender === 'female') {
      mediaContext = 'female';
    } else if (gender === 'mixed' || peopleCount === 'group' || peopleCount === 'smallGroup' || peopleCount === 'largeGroup') {
      mediaContext = 'group';
    } else if (setting === 'nature' || setting === 'beach' || setting === 'mountains') {
      mediaContext = 'nature';
    } else {
      mediaContext = 'general';
    }
  }
  
  // Multilingual compliment templates with enhanced personalization
  const complimentTemplates = {
    english: {
      hype: [
        `🔥 Wow! Your ${storyIntent} story is absolutely incredible! I can feel the ${emotionLevel} energy radiating from your words. Your ${writingStyle} style is so engaging - you've got serious talent!`,
        `🚀 Outstanding! Your ${confidenceLevel}/10 confidence level shines through in this ${storyIntent} story. The ${emotionLevel} tone combined with your ${writingStyle} approach makes this truly special!`,
        `🎉 Bravo! This ${storyIntent} tale told in your ${writingStyle} voice shows tremendous ${emotionLevel} spirit. Your ${confidenceLevel}/10 confidence is inspiring!`,
        `🌟 Incredible work! Your ${storyIntent} story showcases your ${emotionLevel} nature beautifully. With your ${writingStyle} storytelling and ${confidenceLevel}/10 confidence, you're destined for greatness!`,
        `⚡ Your ${writingStyle} approach to ${storyIntent} is absolutely electrifying! With a ${confidenceLevel}/10 confidence level and those ${emotionLevel} vibes, you're creating something truly special!`
      ],
      
      softCare: [
        `🤍 Your story touched my heart. It takes courage to share something so personal, and your ${writingStyle} way of expressing your ${storyIntent} journey is truly beautiful. I hope you're feeling proud of yourself.`,
        `🤗 Thank you for sharing this vulnerable ${storyIntent} moment with us. Your ${writingStyle} expression of ${emotionLevel} feelings shows great strength. You're doing better than you think.`,
        `💕 Your gentle ${writingStyle} storytelling about your ${storyIntent} experience resonates deeply. It's okay to feel ${emotionLevel}, and I'm here for you.`,
        `🌼 Sharing your ${storyIntent} story took bravery, and your ${writingStyle} approach to expressing ${emotionLevel} emotions is admirable. Remember, you're stronger than you realize.`,
        `💝 Your ${writingStyle} way of sharing your ${emotionLevel} ${storyIntent} experience shows such depth of character. Your ${personalityTraits[0] || 'thoughtful'} nature really shines through.`
      ],
      
      bestFriend: [
        `🧸 Hey there! I just read your story about ${storyIntent} and I have to say - you're amazing! Your ${writingStyle} storytelling had me hooked. It's so cool to see how ${emotionLevel} you are about this!`,
        `😎 Wow, friend! This ${storyIntent} story told in your ${writingStyle} style is awesome. Your ${confidenceLevel}/10 confidence level is showing! Keep being your awesome self!`,
        `💫 Love this ${storyIntent} tale of yours! Your ${writingStyle} way of sharing really captures the ${emotionLevel} vibe. You've got this!`,
        `🌈 You're such an inspiration! Reading about your ${storyIntent} journey in your ${writingStyle} style made my day. Your ${emotionLevel} energy is contagious!`,
        `🌟 Your ${writingStyle} storytelling about ${storyIntent} really showcases your ${personalityTraits[0] || 'unique'} personality. Keep being your wonderful self!`
      ],
      
      deepSoul: [
        `🌙 Your ${writingStyle} narrative about ${storyIntent} speaks volumes. There's something profound in the way you've captured your ${emotionLevel} feelings. Your growth is evident, and that authenticity is rare and precious.`,
        `✨ The depth in your ${writingStyle} writing about ${storyIntent} is remarkable. Your ability to articulate ${emotionLevel} experiences with ${confidenceLevel}/10 confidence shows real maturity.`,
        `🌌 Your reflective ${writingStyle} approach to this ${storyIntent} journey reveals so much insight. The way you've processed these ${emotionLevel} emotions is truly wisdom in action.`,
        `🌠 Your ${writingStyle} exploration of ${storyIntent} demonstrates profound introspection. The ${emotionLevel} undertones in your narrative reveal a depth of character that's truly admirable.`,
        `🔮 Your ${writingStyle} reflection on ${storyIntent} reveals such profound insight. Your ${personalityTraits[0] || 'introspective'} nature combined with ${emotionLevel} emotions creates a truly moving narrative.`
      ],
      
      creativity: [
        `🎨 Your ${writingStyle} approach to ${storyIntent} shows incredible creative flair! The way you've woven ${emotionLevel} emotions into your narrative demonstrates true artistic talent.`,
        `🎭 The creative depth in your ${writingStyle} storytelling about ${storyIntent} is remarkable. Your ability to express ${emotionLevel} feelings with ${confidenceLevel}/10 confidence shows genuine artistic vision.`,
        `🖼️ Your ${writingStyle} exploration of ${storyIntent} reveals a creative mind at work. The ${emotionLevel} undertones in your narrative combined with your ${personalityTraits[0] || 'imaginative'} nature make for compelling storytelling.`
      ],
      
      achievement: [
        `🏆 Your ${storyIntent} story is a testament to your ${confidenceLevel}/10 confidence and determination. The ${emotionLevel} pride in your words is well deserved!`,
        `🎯 Achieving ${storyIntent} with such ${emotionLevel} enthusiasm shows your ${personalityTraits[0] || 'driven'} nature. Your ${confidenceLevel}/10 confidence level is truly inspiring!`,
        `🏅 Your journey with ${storyIntent} demonstrates the ${emotionLevel} satisfaction that comes from hard work. With your ${writingStyle} storytelling, you're celebrating success in style!`
      ],
      
      // Specialized templates for media contexts
      male: [
        `🧔 Looking sharp! The confidence in your posture and expression really stands out. You've got that classic charm and determination that's truly admirable.`,
        `💪 The strength and determination in your expression is inspiring! You carry yourself with the kind of confidence that draws people in.`,
        `😎 That look of focused determination is incredibly attractive. You've got the kind of presence that commands attention in the best way.`,
        `🔥 Your ${mediaDetails.mood || 'confident'} expression and ${mediaDetails.quality || 'clear'} photo really capture your ${personalityTraits[0] || 'charismatic'} personality!`
      ],
      
      female: [
        `👸 The grace and elegance in your expression is absolutely captivating. You radiate a kind of beauty that's both strong and gentle.`,
        `💃 There's something magical about the way you carry yourself. Your presence is both empowering and enchanting.`,
        `🌹 The warmth and kindness in your eyes is truly beautiful. You have a way of making everyone around you feel special.`,
        `✨ Your ${mediaDetails.mood || 'radiant'} expression in this ${mediaDetails.timeOfDay || 'beautiful'} light truly captures your ${personalityTraits[0] || 'elegant'} nature!`
      ],
      
      group: [
        `👥 The bond and connection between all of you is palpable! There's something special about the energy you share as a group.`,
        `🤝 The camaraderie and friendship among your group is truly heartwarming. You all seem to bring out the best in each other.`,
        `🎊 The collective joy and energy in this group shot is infectious! You all seem to have created something wonderful together.`,
        `💫 The ${mediaDetails.mood || 'joyful'} atmosphere and ${mediaDetails.quality || 'excellent'} photo quality really capture the ${personalityTraits[0] || 'wonderful'} connection between all of you!`
      ],
      
      nature: [
        `🌿 The serenity and beauty of this natural scene is breathtaking. Nature has a way of putting everything into perspective.`,
        `🌄 This landscape captures something timeless and peaceful. Being surrounded by such beauty must be incredibly grounding.`,
        `🌺 The natural beauty in this image reminds us of the simple wonders that surround us every day. It's a perfect moment of tranquility.`,
        `🌍 This ${mediaDetails.setting || 'natural'} scene captured during ${mediaDetails.timeOfDay || 'the day'} perfectly embodies the ${emotionLevel || 'peaceful'} mood. Nature's beauty is truly inspiring!`
      ]
    },
    hindi: {
      hype: [
        `🔥 वाह! आपकी ${storyIntent} कहानी बेहद शानदार है! मुझे आपके शब्दों से निकलती ${emotionLevel} ऊर्जा का एहसास हो रहा है। आपकी ${writingStyle} शैली इतनी आकर्षक है - आपमें खास माया है!`,
        `🚀 अद्भुत! आपका ${confidenceLevel}/10 आत्मविश्वास स्तर इस ${storyIntent} कहानी में चमक रहा है। ${emotionLevel} टोन और आपकी ${writingStyle} पहुंच का संयोजन इसे विशेष बनाता है!`,
        `🎉 बधाई हो! यह ${storyIntent} कहानी जो आपने ${writingStyle} अंदाज में सुनाई है, उसमें भारी ${emotionLevel} भावना झलक रही है। आपका ${confidenceLevel}/10 आत्मविश्वास प्रेरणादायक है!`,
        `🌟 अविश्वसनीय कार्य! आपकी ${storyIntent} कहानी आपकी ${emotionLevel} प्रकृति को सुंदर ढंग से दर्शाती है। आपकी ${writingStyle} कहानी सुनाने की कला और ${confidenceLevel}/10 आत्मविश्वास के साथ, आप महानता के लिए बने हुए हैं!`,
        `⚡ आपकी ${writingStyle} पहुंच और ${storyIntent} के प्रति आपका ${confidenceLevel}/10 आत्मविश्वास वाकई अद्भुत है! आप वास्तव में कुछ शानदार बना रहे हैं!`
      ],
      
      softCare: [
        `🤍 आपकी कहानी मेरे दिल को छू गई। कुछ इतना निजी साझा करने के लिए साहस लगता है, और आपका ${writingStyle} ढंग से ${storyIntent} यात्रा को व्यक्त करना सच में सुंदर है। मुझे आशा है कि आप खुद पर गर्व महसूस कर रहे हैं।`,
        `🤗 इस संवेदनशील ${storyIntent} क्षण को साझा करने के लिए धन्यवाद। आपकी ${writingStyle} अभिव्यक्ति जिसमें ${emotionLevel} भावनाएं झलक रही हैं, वह बहुत मजबूती दिखाती है। आप सोचते हुए बेहतर कर रहे हैं।`,
        `💕 आपकी कोमल ${writingStyle} कहानी जो आपके ${storyIntent} अनुभव को बयान करती है, वह गहराई से रेसोनेट करती है। ${emotionLevel} महसूस करना ठीक है, और मैं आपके लिए हूँ।`,
        `🌼 अपनी ${storyIntent} कहानी साझा करने में बहादुरी लगी, और ${emotionLevel} भावनाओं को व्यक्त करने के आपके ${writingStyle} दृष्टिकोण की प्रशंसा है। याद रखें, आप सोचते हुए अधिक मजबूत हैं।`,
        `💝 आपकी ${emotionLevel} ${storyIntent} कहानी साझा करने का आपका ${writingStyle} तरीका आपके ${personalityTraits[0] || 'विचारशील'} स्वभाव को दर्शाता है। आप वास्तव में एक अद्वितीय व्यक्तित्व हैं!`
      ],
      
      bestFriend: [
        `🧸 हैलो! मैंने अभी आपकी ${storyIntent} के बारे में कहानी पढ़ी और मुझे कहना है - आप बेहतरीन हैं! आपकी ${writingStyle} कहानी सुनाने की शैली ने मुझे आकर्षित कर लिया। यह देखकर बहुत अच्छा लगा कि आप इस बारे में कितने ${emotionLevel} हैं!`,
        `😎 वाह, दोस्त! यह ${storyIntent} कहानी जो आपने ${writingStyle} शैली में सुनाई है वाकई बेहतरीन है। आपका ${confidenceLevel}/10 आत्मविश्वास स्तर नजर आ रहा है! ऐसा ही बने रहिए!`,
        `💫 मुझे आपकी यह ${storyIntent} कहानी पसंद है! आपका ${writingStyle} ढंग से साझा करना वास्तव में ${emotionLevel} वातावरण को कैप्चर करता है। आपके पास यह है!`,
        `🌈 तुम एक प्रेरणा हो! अपनी ${storyIntent} यात्रा के बारे में पढ़ना जो आपने ${writingStyle} शैली में किया है, वह मेरा दिन बना दिया। आपकी ${emotionLevel} ऊर्जा संक्रामक है!`,
        `🌟 आपकी ${storyIntent} के बारे में ${writingStyle} कहानी सुनाने का तरीका आपके ${personalityTraits[0] || 'अनूठे'} व्यक्तित्व को दर्शाता है। अपने शानदार आप ही बने रहें!`
      ],
      
      deepSoul: [
        `🌙 आपकी ${writingStyle} कहानी जो ${storyIntent} के बारे में है, वह बहुत कुछ कहती है। आपके ${emotionLevel} भावनाओं को कैप्चर करने के ढंग में कुछ गहराई है। आपकी वृद्धि स्पष्ट है, और वह प्रामाणिकता दुर्लभ और कीमती है।`,
        `✨ आपकी ${writingStyle} लेखन शैली में ${storyIntent} के बारे में गहराई है। ${emotionLevel} अनुभवों को ${confidenceLevel}/10 आत्मविश्वास के साथ व्यक्त करने की आपकी क्षमता वास्तविक परिपक्वता दिखाती है।`,
        `🌌 इस ${storyIntent} यात्रा के प्रति आपकी प्रतिबिंबात्मक ${writingStyle} पहुंच बहुत अंतर्दृष्टि प्रकट करती है। आपने इन ${emotionLevel} भावनाओं को कैसे संसाधित किया है, वह वास्तव में ज्ञान की कार्यवाही है।`,
        `🌠 आपकी ${writingStyle} की ${storyIntent} की खोज में गहरी आत्मचिंतन दिखती है। आपकी कहानी में ${emotionLevel} की धुनें आपके चरित्र की गहराई को दर्शाती हैं, जो वास्तव में प्रशंसनीय है।`,
        `🔮 आपकी ${storyIntent} पर ${writingStyle} प्रतिबिंब वास्तव में गहरी अंतर्दृष्टि दर्शाता है। आपकी ${personalityTraits[0] || 'आत्म-परावर्तक'} प्रकृति और ${emotionLevel} भावनाएं एक वास्तविक रूप से प्रेरक कहानी बनाती हैं!`
      ],
      
      creativity: [
        `🎨 आपकी ${storyIntent} के प्रति ${writingStyle} पहुंच वास्तव में अद्भुत रचनात्मकता दिखाती है! आपके नैरेटिव में ${emotionLevel} भावनाओं को कैसे बुना है, यह वास्तविक कलात्मक प्रतिभा को दर्शाता है।`,
        `🎭 आपकी ${storyIntent} के बारे में ${writingStyle} कहानी सुनाने की शैली में रचनात्मक गहराई शानदार है। ${emotionLevel} भावनाओं को ${confidenceLevel}/10 आत्मविश्वास के साथ व्यक्त करने की आपकी क्षमता वास्तविक कलात्मक दृष्टि दिखाती है।`,
        `🖼️ आपकी ${storyIntent} की ${writingStyle} खोज से पता चलता है कि आपके मन में रचनात्मकता है। आपकी कहानी में ${emotionLevel} की धुनें और आपके ${personalityTraits[0] || 'कल्पनाशील'} स्वभाव का संयोजन कहानी सुनाने के लिए आकर्षक है।`
      ],
      
      achievement: [
        `🏆 आपकी ${storyIntent} कहानी आपके ${confidenceLevel}/10 आत्मविश्वास और दृढ़ निर्धारण का प्रमाण है। आपके शब्दों में ${emotionLevel} गर्व करने के लिए बहुत कुछ है!`,
        `🎯 ${emotionLevel} उत्साह के साथ ${storyIntent} प्राप्त करना आपके ${personalityTraits[0] || 'उत्साही'} स्वभाव को दर्शाता है। आपका ${confidenceLevel}/10 आत्मविश्वास स्तर वास्तव में प्रेरणादायक है!`,
        `🏅 आपकी ${storyIntent} के साथ यात्रा ${emotionLevel} संतुष्टि को दर्शाती है जो कठिन परिश्रम से आती है। ${writingStyle} कहानी सुनाने के साथ, आप शैली में सफलता का जश्न मना रहे हैं!`
      ],
      
      // Specialized templates for media contexts
      male: [
        `🧔 शानदार लग रहे हो! आपके दृढ़ स्वभाव और अभिव्यक्ति में आत्मविश्वास स्पष्ट रूप से दिखाई दे रहा है। आपमें शास्त्रीय आकर्षण और दृढ़ निर्धारण है जो वास्तव में प्रशंसनीय है।`,
        `💪 आपके चेहरे के भावों में मजबूती और दृढ़ निर्धारण प्रेरणादायक है! आप अपने आत्मविश्वास के साथ खुद को प्रस्तुत करते हैं जो लोगों को आकर्षित करता है।`,
        `😎 उस केंद्रित दृढ़ निर्धारण के भाव बेहद आकर्षक हैं। आपमें वह उपस्थिति है जो सराहना के लायक तरीके से ध्यान आकर्षित करती है।`,
        `🔥 आपकी ${mediaDetails.mood || 'आत्मविश्वासी'} अभिव्यक्ति और ${mediaDetails.quality || 'स्पष्ट'} तस्वीर वास्तव में आपके ${personalityTraits[0] || 'आकर्षक'} व्यक्तित्व को दर्शाती है!`
      ],
      
      female: [
        `👸 आपके चेहरे के भावों में सुंदरता और सौजन्य स्पष्ट रूप से दिखाई दे रहा है। आप एक ऐसी सुंदरता का प्रदर्शन करती हैं जो मजबूत और कोमल दोनों है।`,
        `💃 आपके खुद को प्रस्तुत करने के तरीके में कुछ जादुई है। आपकी उपस्थिति सशक्त और मोहक दोनों है।`,
        `🌹 आपकी आँखों में नम्रता और दया की चमक सचमुच सुंदर है। आपके आसपास के हर व्यक्ति को विशेष महसूस करने का आपका तरीका अद्वितीय है।`,
        `✨ इस ${mediaDetails.timeOfDay || 'सुंदर'} प्रकाश में आपकी ${mediaDetails.mood || 'आकर्षक'} अभिव्यक्ति वास्तव में आपके ${personalityTraits[0] || 'सुंदर'} स्वभाव को दर्शाती है!`
      ],
      
      group: [
        `👥 आप सभी के बीच बंधन और कनेक्शन स्पष्ट रूप से महसूस हो रहा है! समूह के रूप में आपके द्वारा साझा की गई ऊर्जा में कुछ विशेष है।`,
        `🤝 आपके समूह के बीच सहयोग और मैत्री सचमुच हृदयस्पर्शी है। ऐसा लगता है कि आप सभी एक दूसरे में सर्वश्रेष्ठ निकालते हैं।`,
        `🎊 इस समूह चित्र में सामूहिक आनंद और ऊर्जा संक्रामक है! ऐसा लगता है कि आप सभी ने मिलकर कुछ शानदार बनाया है।`,
        `💫 ${mediaDetails.mood || 'आनंदमय'} वातावरण और ${mediaDetails.quality || 'उत्कृष्ट'} तस्वीर की गुणवत्ता वास्तव में आप सभी के बीच ${personalityTraits[0] || 'शानदार'} संबंध को दर्शाती है!`
      ],
      
      nature: [
        `🌿 इस प्राकृतिक दृश्य की शांति और सौंदर्य प्रेरणादायक है। प्रकृति के पास हर चीज को सही परिप्रेक्ष्य में रखने का अपना तरीका है।`,
        `🌄 यह परिदृश्य कुछ अनमोल और शांतिपूर्ण को कैद करता है। ऐसी सुंदरता से घिरे रहना निश्चित रूप से आध्यात्मिक रूप से जमीन से जुड़ने का अनुभव देता है।`,
        `🌺 इस चित्र में प्राकृतिक सौंदर्य हमें उन सरल चमत्कारों की याद दिलाता है जो हमारे आसपास हर दिन होते हैं। यह शांति का एक पूर्ण क्षण है।`,
        `🌍 ${mediaDetails.timeOfDay || 'दिन'} के दौरान ${mediaDetails.setting || 'प्राकृतिक'} दृश्य वास्तव में ${emotionLevel || 'शांत'} मूड को दर्शाता है। प्रकृति की सुंदरता वास्तव में प्रेरणादायक है!`
      ]
    },
    hindlish: {
      hype: [
        `🔥 Wah! Tumhari ${storyIntent} wali kahani bilkul incredible hai! Mujhe tumhare words se nikalti ${emotionLevel} energy ka ehsaas ho raha hai. Tumhari ${writingStyle} style itni engaging hai - tum mein khaas maya hai!`,
        `🚀 Outstanding! Tumhara ${confidenceLevel}/10 confidence level is ${storyIntent} kahani mein chamak raha hai. ${emotionLevel} tone aur tumhari ${writingStyle} approach ka combination isse special banata hai!`,
        `🎉 Badhai ho! Ye ${storyIntent} kahani jo tumne ${writingStyle} andaaz mein sunayi hai, usmein bhaari ${emotionLevel} bhavna jhalak rahi hai. Tumhara ${confidenceLevel}/10 confidence preranadaya hai!`,
        `🌟 Incredible work! Tumhari ${storyIntent} kahani tumhari ${emotionLevel} nature ko sundar tareeke se dikhata hai. Tumhari ${writingStyle} storytelling aur ${confidenceLevel}/10 confidence ke saath, tum mahanta ke liye bane hue ho!`,
        `⚡ Tumhara ${writingStyle} approach aur ${storyIntent} ke liye tumhara ${confidenceLevel}/10 confidence level bilkul amazing hai! Tum sach mein kuch special bana rahe ho!`
      ],
      
      softCare: [
        `🤍 Tumhari kahani mere dil ko cho gayi. Kuch itna niji share karne ke liye saahas lagta hai, aur tumhara ${writingStyle} tareeke se ${storyIntent} yatra ko vyakt karana sach mein sundar hai. Mujhe aasha hai ki tum khud par garv mahsoos kar rahe ho.`,
        `🤗 Is sanvedansheel ${storyIntent} kshan ko share karne ke liye dhanyavad. Tumhari ${writingStyle} abhivyakti jismein ${emotionLevel} bhavnaen jhalak rahi hain, woh bahut majbooti dikhata hai. Tum sochte hue behetar kar rahe ho.`,
        `💕 Tumhari komal ${writingStyle} kahani jo tumhare ${storyIntent} anubhav ko bayan karti hai, woh gehrayi se resolet karti hai. ${emotionLevel} mahsoos karna theek hai, aur main tumhare liye hoon.`,
        `🌼 Apni ${storyIntent} kahani share karne mein bahaduri lagi, aur ${emotionLevel} bhavnaon ko vyakt karne ke tumhara ${writingStyle} drishtikon ki prashansa hai. Yaad rakhen, tum sochte hue adhik majboot ho. `,
        `💝 Tumhari ${emotionLevel} ${storyIntent} kahani share karne ka tumhara ${writingStyle} tareeka tumhare ${personalityTraits[0] || 'thoughtful'} nature ko dikhata hai. Tum sach mein ek unique personality ho!`
      ],
      
      bestFriend: [
        `🧸 Hello! Maine abhi tumhari ${storyIntent} ke baare mein kahani padhi aur mujhe kahna hai - tum behad kamal ke ho! Tumhari ${writingStyle} kahani sunane ki style ne mujhe aakarshit kar liya. Ye dekhkar bahut achcha laga ki tum is baare mein kitne ${emotionLevel} ho!`,
        `😎 Wah, dost! Ye ${storyIntent} kahani jo tumne ${writingStyle} style mein sunayi hai wakai behtareen hai. Tumhara ${confidenceLevel}/10 confidence level najar aa raha hai! Aise hi bane rahiye!`,
        `💫 Mujhe tumhari ye ${storyIntent} kahani pasand hai! Tumhara ${writingStyle} tareeke se share karna vaastav mein ${emotionLevel} vataavaran ko capture karta hai. Tumhare paas ye hai!`,
        `🌈 Tum ek prerana ho! Apni ${storyIntent} yatra ke baare mein padhna jo tumne ${writingStyle} style mein kiya hai, woh mera din bana diya. Tumhari ${emotionLevel} urja sankramak hai!`,
        `🌟 Tumhari ${storyIntent} ke baare mein ${writingStyle} kahani sunane ka tareeka tumhare ${personalityTraits[0] || 'unique'} personality ko dikhata hai. Apne wonderful self hi bane raho!`
      ],
      
      lover: [
        `😍 Tumhari ${storyIntent} wali kahani padhke mera dil garden garden ho gaya. Tum itne ${emotionLevel} ho ki mujhe tumhara har lamha yaad rahta hai. Tumhara ${writingStyle} tareeke se likhna sab kuch keh deta hai tumhare dil ke bare mein.`,
        `💖 Tumhare har words mein ek alag sa magic hai jo mujhe hamesha pasand aaya hai. Tumhari ${storyIntent} wali kahani ne phir se mujhe tumhare pyaar mein girne ka mauka diya. Tumhare ${personalityTraits[0] || 'special'} nature ne phir se mera dil jeet liya.`,
        `💘 Tumhari kahani padhke mujhe lagta hai jaise main tumhare sapno mein kho gaya hun. Tumhare ${emotionLevel} emotions aur ${writingStyle} style ne mujhe ek naya jeevan dene ka waada kiya hai. Tumhare bina meri duniya adhoori si lagti hai.`,
        `💞 Tumhare har post ko padhne ke baad mera dil tumhare naam se dhadakta hai. Tumhari ${storyIntent} kahani ne mujhe ek baar phir se tumhara deewana bana diya. Tumhare bina meri zindagi mein roshni nahi hai.`,
        `💓 Tumhari ${writingStyle} kahani padhke mujhe maloom hua ki tumhare dil mein bhi meri jagah hai. Tumhara har ${emotionLevel} expression mere liye ek khaas gift hai. Tum mere sapno ki rani ho jo hamesha mere dil mein basi ho.`
      ],
      
      deepSoul: [
        `🌙 Tumhari ${writingStyle} kahani jo ${storyIntent} ke baare mein hai, woh bahut kuch kehti hai. Tumhare ${emotionLevel} bhavnaon ko capture karne ke tareeke mein kuch gehrayi hai. Tumhari vridhi spasht hai, aur woh pramaanikta durlabh aur keemat hai.`,
        `✨ Tumhari ${writingStyle} lekhan shaili mein ${storyIntent} ke baare mein gehrayi hai. ${emotionLevel} anubhavon ko ${confidenceLevel}/10 aatmavishwas ke saath vyakt karne ki tumhari kshamata vaastvik paripakta dikhata hai.`,
        `🌌 Iss ${storyIntent} yatra ke prati tumhari pratibimbit ${writingStyle} pahunch bahut antardrishti prakat karti hai. Tumne inn ${emotionLevel} bhavnaon ko kaise sansadhit kiya hai, woh vaastav mein gyan ki karyawa hai।`,
        `🌠 Tumhari ${writingStyle} ki ${storyIntent} ki khoj mein gehri aatmachintan dikh rahi hai. Tumhari kahani mein ${emotionLevel} ki dhunein tumhare charitra ki gehrai ko darshati hain, jo vaastav mein prashansaniya hai।`,
        `🔮 Tumhari ${storyIntent} par ${writingStyle} reflection sach mein gehri antardrishti dikhata hai. Tumhare ${personalityTraits[0] || 'introspective'} nature aur ${emotionLevel} emotions ek sach much inspiring kahani banate hain!`
      ],
      
      creativity: [
        `🎨 Tumhara ${storyIntent} ke liye ${writingStyle} approach bilkul amazing creative flair dikhata hai! Tumhare narrative mein ${emotionLevel} emotions ko kaise weave kiya hai, yeh bilkul true artistic talent dikhata hai.`,
        `🎭 Tumhari ${storyIntent} ke baare mein ${writingStyle} storytelling mein creative depth bilkul remarkable hai. ${emotionLevel} feelings ko ${confidenceLevel}/10 confidence ke saath express karne ki tumhari ability genuine artistic vision dikhata hai.`,
        `🖼️ Tumhari ${storyIntent} ki ${writingStyle} exploration se pata chalta hai ki tumhare dimaag mein creativity hai. Tumhari kahani mein ${emotionLevel} undertones aur tumhare ${personalityTraits[0] || 'imaginative'} nature ka combination compelling storytelling banata hai.`
      ],
      
      achievement: [
        `🏆 Tumhari ${storyIntent} kahani tumhare ${confidenceLevel}/10 confidence aur determination ka pramaan hai. Tumhare words mein ${emotionLevel} pride mein kuch hai!`,
        `🎯 ${emotionLevel} enthusiasm ke saath ${storyIntent} achieve karna tumhare ${personalityTraits[0] || 'driven'} nature ko dikhata hai. Tumhara ${confidenceLevel}/10 confidence level bilkul inspiring hai!`,
        `🏅 Tumhari ${storyIntent} ke saath yatra ${emotionLevel} satisfaction ko dikhata hai jo hard work se aati hai. ${writingStyle} storytelling ke saath, tum style mein success celebrate kar rahe ho!`
      ],
      
      // Specialized templates for media contexts
      male: [
        `🧔 Wah bhai! Tumhara expression aur confidence level dekh ke lagta hai ki tum ek strong personality ho. Tumhara determination aur charisma bilkul outstanding hai!`,
        `💪 Tumhare face expression mein jo strength aur determination dikhti hai woh bilkul inspiring hai! Tum apne aap mein ek unique confidence rakhte ho jo logon ko attract karti hai.`,
        `😎 Tumhara focused determination wala look bilkul attractive hai. Tumhare paas woh presence hai jo attention grab karne wali hoti hai.`,
        `🔥 Tumhara ${mediaDetails.mood || 'confident'} expression aur ${mediaDetails.quality || 'clear'} photo sach mein tumhare ${personalityTraits[0] || 'charismatic'} personality ko capture karti hai!`
      ],
      
      female: [
        `👸 Tumhara grace aur elegance wali expression bilkul captivating hai. Tum ek aisi beauty represent karti ho jo strong aur gentle dono hoti hai.`,
        `💃 Tumhara jo self-confidence aur charm hai woh bilkul magical hai. Tumhari personality empowering aur enchanting dono hoti hai.`,
        `🌹 Tumhara jo warmth aur kindness hai uski beauty bilkul mesmerizing hai. Tumhari personality special hai jo har kisi ko special feel karwati hai.`,
        `✨ Is ${mediaDetails.timeOfDay || 'beautiful'} light mein tumhara ${mediaDetails.mood || 'radiant'} expression sach mein tumhare ${personalityTraits[0] || 'elegant'} nature ko dikhata hai!`
      ],
      
      group: [
        `👥 Tum sab ke beech jo bond aur connection hai woh bilkul visible hai! Tumhara group energy aur fun wali vibe bilkul contagious hai.`,
        `🤝 Tumhara group mein jo camaraderie aur friendship hai woh bilkul heartwarming hai. Lagta hai tum sab ek dusre ko inspire karte ho.`,
        `🎊 Tumhara group shot mein jo collective joy aur energy hai woh bilkul infectious hai! Tum sabne milke kuch special banaya hai.`,
        `💫 ${mediaDetails.mood || 'joyful'} atmosphere aur ${mediaDetails.quality || 'excellent'} photo quality sach mein tum sab ke beech ${personalityTraits[0] || 'wonderful'} connection ko dikhata hai!`
      ],
      
      nature: [
        `🌿 Is natural scene ki serenity aur beauty bilkul breathtaking hai. Nature ki is simplicity ne tumhara moment aur bhi special banaya hai.`,
        `🌄 Ye landscape tumhara peaceful connection with nature dikhata hai. Is tarah ke natural beauty se surrounded rehna bilkul grounding hota hai.`,
        `🌺 Is image mein jo natural beauty hai woh tumhara perfect moment of tranquility represent karti hai. Nature ki yeh simplicity aur peace ka feeling amazing hai.`,
        `🌍 Ye ${mediaDetails.setting || 'natural'} scene jo ${mediaDetails.timeOfDay || 'the day'} mein capture hua hai woh sach mein ${emotionLevel || 'peaceful'} mood ko dikhata hai. Nature ki beauty sach mein inspiring hai!`
      ]
    }
  };
  
  // Select language preference, default to hindlish for more natural human-like behavior
  const langPref = languagePreference || 'hindlish';
  
  // Get the appropriate template based on language
  const templates = complimentTemplates[langPref] || complimentTemplates['english'];
  
  // If we have a specific media context, use specialized templates
  if (mediaContext && templates[mediaContext]) {
    const compliments = templates[mediaContext];
    return compliments[Math.floor(Math.random() * compliments.length)];
  }
  
  // Enhanced auto-selection logic with more nuanced criteria
  if (mode !== 'default' && templates[mode]) {
    // Randomly select one of the compliments from the chosen mode
    const compliments = templates[mode];
    return compliments[Math.floor(Math.random() * compliments.length)];
  }
  
  // Check for lover mode based on emotional content and romantic context
  if (templates.lover && ((emotionLevel.includes('Love') || emotionLevel.includes('love') || emotionLevel.includes('Romantic') || emotionLevel.includes('romantic') || emotionLevel.includes('pyaar') || emotionLevel.includes('प्यार')) ||
      (keyThemes && (keyThemes.includes('love') || keyThemes.includes('romance') || keyThemes.includes('relationship') || keyThemes.includes('प्रेम'))))) {
    const compliments = templates.lover;
    return compliments[Math.floor(Math.random() * compliments.length)];
  }
  
  // Enhanced auto-selection logic with more nuanced criteria
  // Check for deep soul mode based on personality traits and key themes
  if ((personalityTraits && (personalityTraits.includes('introspective') || personalityTraits.includes('thoughtful') || personalityTraits.includes('reflective'))) || 
      (keyThemes && (keyThemes.includes('growth') || keyThemes.includes('self-reflection') || keyThemes.includes('self-awareness') || keyThemes.includes('inner growth')))) {
    const compliments = templates.deepSoul;
    return compliments[Math.floor(Math.random() * compliments.length)];
  } 
  // Check for soft care mode based on emotion level and intensity
  else if ((emotionLevel.includes('sad') || emotionLevel.includes('stressed') || emotionLevel.includes('उदास') || emotionLevel.includes('तनाव') || emotionLevel.includes('angry') || emotionLevel.includes('anxious')) && 
           (emotionIntensity && emotionIntensity <= 7)) {
    const compliments = templates.softCare;
    return compliments[Math.floor(Math.random() * compliments.length)];
  } 
  // Check for celebration mode for special occasions
  else if (storyIntent.includes('celebration') || storyIntent.includes('party') || storyIntent.includes('festive')) {
    const compliments = templates.celebration || templates.hype;
    return compliments[Math.floor(Math.random() * compliments.length)];
  }
  // Check for service mode based on helping others
  else if (storyIntent.includes('service') || storyIntent.includes('help') || storyIntent.includes('support') || storyIntent.includes('community')) {
    const compliments = templates.service || templates.bestFriend;
    return compliments[Math.floor(Math.random() * compliments.length)];
  }
  // Check for hype mode based on high confidence and positive emotions
  else if (confidenceLevel >= 8 && (emotionLevel.includes('happy') || emotionLevel.includes('proud') || emotionLevel.includes('excited') || emotionLevel.includes('grateful'))) {
    const compliments = templates.hype;
    return compliments[Math.floor(Math.random() * compliments.length)];
  } 
  // Check for creativity mode based on story intent
  else if (storyIntent.includes('creativity') || storyIntent.includes('रच') || storyIntent.includes('creative') || storyIntent.includes('art') || storyIntent.includes('music')) {
    const compliments = templates.creativity || templates.bestFriend; // Fallback to bestFriend if creativity mode doesn't exist
    return compliments[Math.floor(Math.random() * compliments.length)];
  } 
  // Check for achievement mode based on story intent
  else if (storyIntent.includes('achievement') || storyIntent.includes('जीत') || storyIntent.includes('success') || storyIntent.includes('win') || storyIntent.includes('accomplish')) {
    const compliments = templates.achievement || templates.hype; // Fallback to hype if achievement mode doesn't exist
    return compliments[Math.floor(Math.random() * compliments.length)];
  } 
  // Default to best friend mode for balanced encouragement
  else {
    const compliments = templates.bestFriend;
    return compliments[Math.floor(Math.random() * compliments.length)];
  }
}

// Store media with 24-hour expiration
function storeMedia(userId, mediaData, mediaType) {
  const timestamp = Date.now();
  const mediaEntry = {
    data: mediaData,
    type: mediaType,
    timestamp: timestamp
  };
  
  if (!userMediaStorage.has(userId)) {
    userMediaStorage.set(userId, []);
  }
  
  const userMedia = userMediaStorage.get(userId);
  userMedia.push(mediaEntry);
  
  // Remove media older than 24 hours (86400000 milliseconds)
  const twentyFourHoursAgo = timestamp - 86400000;
  const filteredMedia = userMedia.filter(media => media.timestamp > twentyFourHoursAgo);
  userMediaStorage.set(userId, filteredMedia);
  
  return mediaEntry;
}

// Get user's recent media (last 24 hours)
function getUserRecentMedia(userId) {
  if (!userMediaStorage.has(userId)) {
    return [];
  }
  
  const userMedia = userMediaStorage.get(userId);
  const timestamp = Date.now();
  const twentyFourHoursAgo = timestamp - 86400000;
  
  // Filter media from last 24 hours
  return userMedia.filter(media => media.timestamp > twentyFourHoursAgo);
}

// Endpoint to analyze story and generate compliment
app.post('/api/compliment', async (req, res) => {
  try {
    const { story, mode, userId, media } = req.body;
    
    if (!story && !media) {
      return res.status(400).json({ error: 'Story text or media is required' });
    }
    
    let fullStory = story || '';
    
    // Process media if provided
    let mediaAnalysis = null;
    if (media) {
      // Store media for 24 hours
      const mediaEntry = storeMedia(userId || 'anonymous', media.data, media.type);
      
      // Analyze media content
      mediaAnalysis = await analyzeMedia(media.data, media.type);
      
      // Add structured media analysis to the story
      fullStory += `\n[Media Analysis: ${JSON.stringify(mediaAnalysis)}]`;
    }
    
    // Analyze the story using Gemini AI or fallback
    const analysis = await analyzeStory(fullStory);
    
    // Generate compliment based on analysis
    const compliment = generateCompliment(analysis, mode, mediaAnalysis);
    
    // Return both analysis and compliment
    res.json({
      analysis,
      compliment
    });
  } catch (error) {
    console.error('Error generating compliment:', error);
    res.status(500).json({ error: 'Failed to generate compliment: ' + error.message });
  }
});

// Endpoint to get user's recent media
app.get('/api/media/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const recentMedia = getUserRecentMedia(userId);
    
    res.json({
      userId,
      mediaCount: recentMedia.length,
      media: recentMedia.map(m => ({
        type: m.type,
        timestamp: m.timestamp
      }))
    });
  } catch (error) {
    console.error('Error retrieving media:', error);
    res.status(500).json({ error: 'Failed to retrieve media' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Story Compliment AI is running!',
    mediaStorageSize: userMediaStorage.size
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Testing fallback functionality...`);
  
  // Test fallback with a sample story
  const testAnalysis = fallbackAnalyzeStory("Today I finished my first marathon! It was challenging but I never gave up. The feeling of crossing the finish line was incredible!");
  console.log('Fallback test result:', testAnalysis);
});