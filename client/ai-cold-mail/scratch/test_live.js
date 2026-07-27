const axios = require('axios');

async function testLive() {
  console.log('Sending request to live Render backend...');
  try {
    const res = await axios.post('https://applypilot-ce81.onrender.com/api/ai/generate-email', {
      prompt: 'Company Name: HCL Tech\nHiring Manager: Subham Singh\nJob Description: software developer\nAdditional requirements: ',
      resumeInfo: 'Suraj Yadav - Node.js Developer',
      tone: 'Professional'
    }, {
      headers: {
        // We might need to pass auth header if it is a protected route.
        // Let's check if generate-email route requires auth!
      },
      timeout: 30000
    });
    console.log('Success! Response data:', res.data);
  } catch (err) {
    console.log('Error Status:', err.response?.status);
    console.log('Error Response Data:', err.response?.data);
    console.log('Error Message:', err.message);
  }
}

testLive();
