const express = require("express");
const router = express.Router();
const packingListController = require("../controllers/packingListController");

// POST /api/documents/packing-list
router.post("/packing-list", packingListController.generatePackingList);

module.exports = router;
