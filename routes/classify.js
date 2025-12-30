const express = require("express");
const router = express.Router();

const classifyController = require("../controllers/classifyController");
const { classifyLimiter } = require("../middleware/rateLimit");

/**
 * HS Code classification endpoint
 * - UI gated to paid users
 * - Rate limited for backend protection
 * - Auth temporarily disabled (handled at UI level)
 */
router.post(
  "/",
  classifyLimiter,
  classifyController.classifyProduct
);

module.exports = router;
