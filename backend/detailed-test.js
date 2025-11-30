const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function detailedTest() {
  console.log('🧪 Detailed API Key Test');
  console.log('🔑 API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'NOT FOUND');
  console.log('🔑 API Key Length:', process.env.GEMINI_API_KEY?.length || 0);
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('\n❌ ERROR: No API key found!');
    return;
  }

  try {
    console.log('\n🔄 Testing basic API connectivity...');
    
    // Test with a simple model request
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    console.log('📝 Sending test prompt...');
    const prompt = "What is 2+2? Respond with just the number.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ SUCCESS!');
    console.log('📝 Response:', text.trim());
    
  } catch (error) {
    console.log('❌ FAILED:');
    console.log('📝 Error Message:', error.message);
    console.log('📝 Error Name:', error.name);
    console.log('📝 Error Stack:', error.stack?.split('\n')[0]);
    
    // Check for specific error types
    if (error.message.includes('404')) {
      console.log('\n🔍 404 Error - This usually means the model name is incorrect or not available');
    } else if (error.message.includes('403')) {
      console.log('\n🔍 403 Error - This usually means the API key is invalid or lacks permissions');
    } else if (error.message.includes('400')) {
      console.log('\n🔍 400 Error - This usually means there is a problem with the request');
    } else if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n🔍 API Key Invalid - The API key is not valid');
    }
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Verify the API key is correct and active in Google Cloud Console');
  console.log('2. Ensure the Generative Language API is enabled for your project');
  console.log('3. Check if there are any IP restrictions or quota limits on your API key');
  console.log('4. Try creating a new API key in Google Cloud Console');
}

// Run the test
detailedTest().catch(console.error);