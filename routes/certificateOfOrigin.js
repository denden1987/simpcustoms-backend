const express = require("express");
const router = express.Router();
const { generateCOO } = require("../controllers/certificateOfOrigin");

// POST /api/documents/certificate-of-origin
router.post("/certificate-of-origin", generateCOO);

module.exports = router;
