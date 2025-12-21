const express = require("express");
const router = express.Router();
const proFormaController = require("../controllers/proFormaController");

router.post("/pro-forma", proFormaController.generateProForma);

module.exports = router;
