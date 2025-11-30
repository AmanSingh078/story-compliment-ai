const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// List of models to test
const modelsToTest = [
  "gemini-pro",
  "gemini-1.0-pro",
  "gemini-1.0-pro-001",
  "gemini-1.5-pro-latest",
  "gemini-1.5-pro-001",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-001",
  "models/gemini-pro",
  "models/gemini-1.0-pro"
];

async function testModel(modelName) {
  try {
    console.log(`\n🔍 Testing model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Simple test prompt
    const prompt = "What is 2+2? Respond with just the number.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    console.log(`✅ SUCCESS: ${modelName} responded with: ${text}`);
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${modelName}`);
    // Show a shortened version of the error
    const errorMsg = error.message.split('.')[0];
    console.log(`   Error: ${errorMsg}`);
    return false;
  }
}

async function findWorkingModel() {
  console.log('🧪 Testing Multiple Model Names');
  console.log('🔑 API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'NOT FOUND');
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('\n❌ ERROR: No API key found!');
    return;
  }

  console.log('\n🔄 Testing models...');
  const workingModels = [];
  
  for (const model of modelsToTest) {
    const success = await testModel(model);
    if (success) {
      workingModels.push(model);
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📋 SUMMARY:');
  if (workingModels.length > 0) {
    console.log(`✅ Found ${workingModels.length} working model(s):`);
    workingModels.forEach(model => console.log(`   • ${model}`));
    console.log('\n📝 To use a specific model, update the model name in server.js:');
    console.log(`   const model = genAI.getGenerativeModel({ model: "${workingModels[0]}" });`);
  } else {
    console.log('❌ No working models found with the current API key.');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify your API key is correct and active');
    console.log('2. Check that the Generative Language API is enabled in Google Cloud Console');
    console.log('3. Ensure your API key has the proper permissions');
    console.log('4. Check if there are any region restrictions on your API key');
    console.log('5. Try creating a new API key in Google Cloud Console');
    console.log('6. Check the Google Cloud Console for available models in your region');
  }
}

// Run the test
findWorkingModel().catch(console.error);