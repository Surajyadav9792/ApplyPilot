const nodemailer = require("nodemailer");
const sendEmail = async (options) => {
    try {
    if(!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("Email credentials are not set in environment variables");
    }
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,   // 10 seconds
    socketTimeout: 15000,     // 15 seconds
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || `<p>${options.text}</p>`, // Optional: If you want to send HTML content
    attachments: options.attachments || [],
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${options.to}`);
} catch (error) {
  console.error(`Error sending email to ${options.to}:`, error);
  throw new Error(error.message || "Email could not be sent");   
 }
};
module.exports = sendEmail;