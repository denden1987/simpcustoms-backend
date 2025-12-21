const express = require("express");
const router = express.Router();
const { generateCreditNote } = require("../controllers/creditNote");

// POST /api/documents/credit-note
router.post("/credit-note", generateCreditNote);

module.exports = router;
