// routes/classify.js
const express = require("express");
const router = express.Router();

const { classifyHSCode } = require("../controllers/classifyController");
const { classifyLimiter } = require("../middleware/rateLimit");

router.post(
  "/",
  classifyLimiter,   // ✅ this IS now a function
  classifyHSCode     // ✅ controller function
);

module.exports = router;
