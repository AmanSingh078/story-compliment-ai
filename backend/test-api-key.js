const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

/**
 * Test script to verify Gemini API key and find working models
 * 
 * Usage:
 * 1. Make sure you have a valid GEMINI_API_KEY in your .env file
 * 2. Run: node test-api-key.js
 * 3. The script will test various models and report which ones work
 */

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// List of models to test
const modelsToTest = [
  "gemini-pro",
  "gemini-1.0-pro",
  "gemini-1.5-pro-latest",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-001",
  "gemini-1.5-flash-001",
  "gemini-2.0-flash-exp",
  "models/gemini-1.5-pro-latest",
  "models/gemini-1.5-flash-latest"
];

async function testModel(modelName) {
  try {
    console.log(`\n🔍 Testing model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Simple test prompt
    const prompt = "Respond with exactly: 'API key verified' and nothing else.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    if (text.includes('API key verified')) {
      console.log(`✅ SUCCESS: ${modelName} is working`);
      return true;
    } else {
      console.log(`⚠️  PARTIAL SUCCESS: ${modelName} responded but not as expected`);
      console.log(`   Response: ${text}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${modelName}`);
    console.log(`   Error: ${error.message.split('.')[0]}`); // Show first part of error
    return false;
  }
}

async function testApiKey() {
  console.log('🧪 Testing Gemini API Key...');
  console.log('🔑 API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'NOT FOUND');
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('\n❌ ERROR: No API key found!');
    console.log('Please add your Gemini API key to the .env file:');
    console.log('GEMINI_API_KEY=your_actual_api_key_here');
    return;
  }

  console.log('\n🔄 Testing models...');
  const workingModels = [];
  
  for (const model of modelsToTest) {
    const success = await testModel(model);
    if (success) {
      workingModels.push(model);
    }
  }
  
  console.log('\n📋 SUMMARY:');
  if (workingModels.length > 0) {
    console.log(`✅ Found ${workingModels.length} working model(s):`);
    workingModels.forEach(model => console.log(`   • ${model}`));
    console.log('\n📝 To use a specific model, update the model name in server.js:');
    console.log(`   const model = genAI.getGenerativeModel({ model: "${workingModels[0]}" });`);
  } else {
    console.log('❌ No working models found.');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify your API key is correct and active');
    console.log('2. Check that the Generative Language API is enabled in Google Cloud Console');
    console.log('3. Ensure your API key has the proper permissions');
    console.log('4. Check if there are any region restrictions on your API key');
  }
}

// Run the test
testApiKey().catch(console.error);