# Model Configuration Guide

If you encounter issues with the default model name (`gemini-pro`), you may need to update it to a model that works with your API key.

## How to Change the Model Name

1. Open `backend/server.js`
2. Find the line that initializes the model (around line 15):
   ```javascript
   const model = genAI.getGenerativeModel({ model: "gemini-pro" });
   ```
3. Replace `"gemini-pro"` with a working model name.

## Common Model Names to Try

- `"gemini-1.0-pro"`
- `"gemini-1.5-pro-latest"`
- `"gemini-1.5-flash-latest"`

## How to Test Which Models Work

Run the provided test script:
```bash
cd backend
node test-api-key.js
```

This will test several common model names and report which ones work with your API key.

## Example Update

Before:
```javascript
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
```

After (if gemini-1.0-pro works):
```javascript
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
```

Remember to make this change in both places in the file:
1. In the `analyzeStory` function
2. In the `test-gemini.js` file (for testing purposes)