const sendEmail = require('./utils/sendEmail');
require('dotenv').config();

async function testSMTP() {
  console.log('Sending test email using new port 465 config...');
  try {
    await sendEmail({
      to: 'surajyadavmahadewa@gmail.com',
      subject: 'Test Email from ApplyPilot (Port 465)',
      text: 'This is a test email sent from the newly configured SMTP port 465.'
    });
    console.log('Test Email Sent Successfully!');
  } catch (err) {
    console.error('Test Email Failed:', err.message);
  }
}

testSMTP();
