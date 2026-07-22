const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  generateEmail,
  getEmailHistory,
} = require("../controller/aiController");

router.post("/generate-email", protect, generateEmail);
router.get("/email-history", protect, getEmailHistory);

module.exports = router;