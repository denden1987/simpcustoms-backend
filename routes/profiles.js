const express = require("express");
const router = express.Router();

const { supabase } = require("../utils/supabaseClient");

// 🔐 Middleware
const { requireAuth } = require("../middleware/auth");
const { attachPlan } = require("../middleware/plan");
const { enforceProfileLimit } = require("../middleware/profileLimit");

/* ----------------------------------
   CREATE SAVED PROFILE
   (Limited for unpaid users)
---------------------------------- */

router.post(
  "/",
  requireAuth,
  attachPlan,
  enforceProfileLimit,
  async (req, res) => {
    try {
      const { type, data } = req.body;

      // ✅ Clean validation
      if (!type || !data) {
        return res.status(400).json({
          error: "Missing type or data",
        });
      }

      const { error } = await supabase.from("saved_profiles").insert({
        user_id: req.user.id,
        type,
        data,
      });

      if (error) {
        console.error("❌ Saved profile insert error:", error);
        return res.status(500).json({
          error: "Failed to save profile",
        });
      }

      res.json({ success: true });
    } catch (err) {
      console.error("❌ Create profile error:", err);
      res.status(500).json({
        error: "Profile creation failed",
      });
    }
  }
);

module.exports = router;
