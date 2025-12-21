const express = require("express");
const router = express.Router();

// Controller (AI-powered)
const classifyController = require("../controllers/classifyController.js");

// 🔐 Auth & billing middleware
const { requireAuth } = require("../middleware/auth");
const { attachPlan } = require("../middleware/plan");
const { requirePaidPlan } = require("../middleware/requirePaidPlan");

/* ----------------------------------
   POST /api/classify
   AI-powered HS code classification
   🔒 PAID ONLY
---------------------------------- */

router.post(
  "/",
  requireAuth,        // user must be logged in
  attachPlan,         // resolve plan + limits
  requirePaidPlan,    // 🔒 HARD BLOCK unpaid users
  classifyController.classifyProduct
);

/* ----------------------------------
   GET /api/classify/health
   (Free, no AI, no auth needed)
---------------------------------- */

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "Classification route is working",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
