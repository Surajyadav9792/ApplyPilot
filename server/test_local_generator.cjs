const mongoose = require('mongoose');
require('dotenv').config();
const { generateEmail } = require('./controller/aiController');
const User = require('./models/User');

async function testLocal() {
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected!');

  const user = await User.findOne({ email: 'surajyadavmahadewa@gmail.com' });
  if (!user) {
    console.log('User not found!');
    await mongoose.disconnect();
    return;
  }
  console.log('Found User:', user.username, 'ID:', user._id);

  const req = {
    user: user,
    body: {
      prompt: 'Company Name: HCL Tech\nHiring Manager: Subham Singh\nJob Description: software developer\nAdditional requirements: ',
      resumeInfo: 'Suraj Yadav - Node.js Developer. React, Node, Express, MongoDB, Redux. Project: ApplyPilot, CodeJudge.',
      tone: 'Professional'
    }
  };

  const res = {
    status: function(code) {
      console.log('Response Status:', code);
      return this;
    },
    json: function(data) {
      console.log('Response JSON:', JSON.stringify(data, null, 2));
      mongoose.disconnect();
    }
  };

  try {
    console.log('Triggering generateEmail controller...');
    await generateEmail(req, res);
  } catch (err) {
    console.error('Controller Crashed:', err);
    mongoose.disconnect();
  }
}

testLocal();
