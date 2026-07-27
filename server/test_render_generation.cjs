const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();
const User = require('./models/User');

const generateAuthToken = (user) => {
  const userId = user._id || user;
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  return token;
}

async function testRenderGen() {
  console.log('Connecting to database to get user...');
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'surajyadavmahadewa@gmail.com' });
  if (!user) {
    console.log('User not found!');
    await mongoose.disconnect();
    return;
  }
  console.log('Found user!', user.username);
  const token = generateAuthToken(user);
  await mongoose.disconnect();

  console.log('Generated token locally. Sending request to live Render backend...');
  try {
    const res = await axios.post('https://applypilot-ce81.onrender.com/api/ai/generate-email', {
      prompt: 'Company Name: HCL Tech\nHiring Manager: Subham Singh\nJob Description: software developer\nAdditional requirements: ',
      resumeInfo: 'Suraj Yadav - Node.js Developer. React, Node, Express, MongoDB, Redux. Project: ApplyPilot, CodeJudge.',
      tone: 'Professional'
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    console.log('Success! Live response data:', res.data);
  } catch (err) {
    console.log('Live Error Status:', err.response?.status);
    console.log('Live Error Data:', JSON.stringify(err.response?.data, null, 2));
    console.log('Live Error Message:', err.message);
  }
}

testRenderGen();
