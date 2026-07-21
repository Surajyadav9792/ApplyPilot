const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken"); 

const generateAuthToken = (user) => {
  const userId = user._id || user;
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  return token;
}

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (username.length > 100 || username.length < 3 ) {
      return res.status(400).json({
        message: "Invalid name",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already in use",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      username,
      email,
      password,
      otp,
      otpExpiry,
    });

    // Send OTP Email Logic
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your Email",
        text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
      });
    } catch (error) {
      console.log({
        message: "Error Sending OTP",
        error: error.message,
      });
    }

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ email });

    if (!user) {  
        return res.status(404).json({ message: "User not found" });
    }
     if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    } 

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }
    user.isVerified = true;
    await user.save();
    const token = generateAuthToken(user._id);
    return res.status(200).json({ message: "OTP verified successfully", token });
   
  }
   catch(error) {
    return res.status(500).json({ message: "Error verifying OTP", error: error.message });
    
  } 

}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password+isVerified");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "User not verified",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      user,
      token: generateAuthToken(user), 
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  register: exports.registerUser,
  verifyOTP: exports.verifyOTP,
  login: exports.login
};  