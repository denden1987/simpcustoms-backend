const express = require("express");
const router = express.Router();

const classifyController = require("../controllers/classifyController");

// 🔴 TEMPORARY: auth + plan checks DISABLED for testing
// This allows us to confirm OpenAI + payload + controller logic works

router.post(
  "/",
  classifyController.classifyProduct
);

module.exports = router;
