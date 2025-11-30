const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listAvailableModels() {
  console.log('🔍 Attempting to list available models...');
  console.log('🔑 API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'NOT FOUND');
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('\n❌ ERROR: No API key found!');
    return;
  }

  try {
    // Try to list models (this might not work in older versions)
    console.log('\n🔄 Checking if listModels method is available...');
    
    if (typeof genAI.listModels === 'function') {
      console.log('✅ listModels method is available, attempting to call it...');
      const models = await genAI.listModels();
      console.log('📝 Available models:');
      if (models && models.models) {
        models.models.forEach(model => {
          console.log(`   • ${model.name}: ${model.displayName || 'No display name'}`);
        });
      } else {
        console.log('   No models returned');
      }
    } else {
      console.log('❌ listModels method is not available in this version');
      console.log('📝 This is normal for older versions of the @google/generative-ai package');
    }
  } catch (error) {
    console.log('❌ FAILED to list models:');
    console.log('📝 Error:', error.message);
    
    // Specific error handling
    if (error.message.includes('404')) {
      console.log('\n🔍 404 Error when listing models - API key or project configuration issue');
    } else if (error.message.includes('403')) {
      console.log('\n🔍 403 Error when listing models - API key permissions issue');
    } else if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n🔍 API Key Invalid - The API key is not valid');
    }
  }
  
  console.log('\n📋 Recommended Next Steps:');
  console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
  console.log('2. Navigate to APIs & Services > Enabled APIs & Services');
  console.log('3. Verify that "Generative Language API" is enabled');
  console.log('4. Check that billing is properly set up for your project');
  console.log('5. If issues persist, try creating a new API key');
}

// Run the test
listAvailableModels().catch(console.error);