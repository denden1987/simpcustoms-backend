const { supabase } = require("../utils/supabaseClient");

/**
 * Enforces saved profile limits.
 * - Unpaid users use DEFAULT_LIMITS
 * - Paid users use PLAN_LIMITS
 */
const enforceProfileLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = req.limits?.saved_profiles;

    if (typeof limit !== "number") {
      return res.status(500).json({
        error: "Profile limits not configured",
      });
    }

    const { count, error } = await supabase
      .from("saved_profiles") // ✅ CORRECT TABLE
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Profile count error:", error);
      return res.status(500).json({ error: "Profile limit check failed" });
    }

    if (count >= limit) {
      return res.status(403).json({
        error: "Profile limit reached",
        code: "PROFILE_LIMIT_REACHED",
        limit,
        used: count,
        isPaid: req.isPaid,
      });
    }

    next();
  } catch (err) {
    console.error("❌ Profile limit middleware error:", err);
    return res.status(500).json({ error: "Profile enforcement failed" });
  }
};

module.exports = { enforceProfileLimit };
