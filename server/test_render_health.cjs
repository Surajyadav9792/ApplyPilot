const axios = require('axios');

async function checkRender() {
  console.log('Sending GET to Render health check...');
  try {
    const res = await axios.get('https://applypilot-ce81.onrender.com/', {
      timeout: 10000
    });
    console.log('Render Root Status:', res.status);
    console.log('Render Root Data:', res.data);
  } catch (err) {
    console.log('Render Root Error Status:', err.response?.status);
    console.log('Render Root Error Message:', err.message);
  }
}

checkRender();
