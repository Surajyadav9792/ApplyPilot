const express=require('express');
const router=express.Router();
const authController=require('../controller/authController');
//register a new user
router.post('/register',authController.register);
//login
router.post('/login',authController.login);

//verify OTP
router.post('/verify-otp',authController.verifyOTP);

module.exports=router;