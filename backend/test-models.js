const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModel(modelName) {
  try {
    console.log(`Testing model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const prompt = "Say hello world";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log(`Success with ${modelName}: ${text}`);
    return true;
  } catch (error) {
    console.log(`Failed with ${modelName}: ${error.message}`);
    return false;
  }
}

async function findWorkingModel() {
  const modelsToTest = [
    "gemini-pro",
    "gemini-1.0-pro",
    "gemini-1.5-pro-latest",
    "gemini-1.5-flash-latest",
    "models/gemini-pro",
    "models/gemini-1.0-pro"
  ];
  
  for (const model of modelsToTest) {
    const success = await testModel(model);
    if (success) {
      console.log(`Found working model: ${model}`);
      return model;
    }
  }
  
  console.log("No working models found");
}

findWorkingModel();