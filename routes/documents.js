const express = require("express");
const router = express.Router();

const { supabase } = require("../utils/supabaseClient");

// 🔐 Auth & Plan middleware
const { requireAuth } = require("../middleware/auth");
const { attachPlan } = require("../middleware/plan");

// 🚦 Usage enforcement (NEW)
const { enforceDocumentLimit } = require("../middleware/usage");

/* -------------------------------------------------
   COMMERCIAL INVOICE (LIMITED)
------------------------------------------------- */

router.post(
  "/commercial-invoice",
  requireAuth,          // must be logged in
  attachPlan,           // must have plan info
  enforceDocumentLimit, // 🚦 enforce document limits
  async (req, res) => {
    try {
      /* ----------------------------------
         YOUR EXISTING DOCUMENT LOGIC
         (DO NOT CHANGE ITS INTERNALS)
      ---------------------------------- */

      // Example placeholder – replace with your real logic
      const invoiceData = {
        invoiceNumber: "INV-001",
        date: new Date().toISOString(),
        customer: req.body.customer,
        items: req.body.items,
      };

      // Pretend document generation succeeded
      const generatedDocument = {
        success: true,
        document: invoiceData,
      };

      /* ----------------------------------
         RECORD USAGE (ONLY AFTER SUCCESS)
      ---------------------------------- */

      await supabase.from("document_usage").insert({
        user_id: req.user.id,
      });

      return res.json(generatedDocument);
    } catch (err) {
      console.error("❌ Commercial invoice error:", err);
      return res.status(500).json({
        error: "Failed to generate commercial invoice",
      });
    }
  }
);

/* -------------------------------------------------
   OTHER DOCUMENT ROUTES (NOT YET GATED)
------------------------------------------------- */

// Example – leave these UNCHANGED for now
router.post("/packing-list", async (req, res) => {
  // existing logic untouched
  res.json({ message: "Packing list generated" });
});

router.post("/pro-forma", async (req, res) => {
  // existing logic untouched
  res.json({ message: "Pro forma invoice generated" });
});

router.post("/credit-note", async (req, res) => {
  // existing logic untouched
  res.json({ message: "Credit note generated" });
});

router.post("/certificate-of-origin", async (req, res) => {
  // existing logic untouched
  res.json({ message: "COO generated" });
});

module.exports = router;
