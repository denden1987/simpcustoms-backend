const express = require("express");
const router = express.Router();

const { classifyHSCode } = require("../controllers/classifyController");

// 🔓 TEMP: no auth, no rate limit (debugging only)
router.post("/", classifyHSCode);

module.exports = router;
