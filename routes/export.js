const express = require("express");
const router = express.Router();

const { generateBeginnerBundle } = require("../controllers/export");

// POST /api/export/beginner-bundle
router.post("/beginner-bundle", generateBeginnerBundle);

module.exports = router;
