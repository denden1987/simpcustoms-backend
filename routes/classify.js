const express = require("express");
const rateLimit = require("../middleware/rateLimit");
const { classifyHSCode } = require("../controllers/classifyController");

const router = express.Router();

router.post("/", rateLimit, classifyHSCode);

module.exports = router;
