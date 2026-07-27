const axios = require('axios');
require('dotenv').config({ path: '../server/.env' });

async function testOpenRouter() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log('Using API Key:', apiKey ? (apiKey.substring(0, 10) + '...') : 'undefined');
  
  const systemPrompt = `You are a helpful assistant. You must return a valid JSON object with the keys "greeting" and "body".`;
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Say hello and say how you are doing.' }
  ];

  try {
    const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'meta-llama/llama-3.3-70b-instruct',
      messages: messages,
      max_tokens: 256,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    console.log('Success! Choices:', JSON.stringify(res.data.choices, null, 2));
  } catch (err) {
    console.log('Error status:', err.response?.status);
    console.log('Error data:', JSON.stringify(err.response?.data, null, 2));
    console.log('Error message:', err.message);
  }
}

testOpenRouter();
