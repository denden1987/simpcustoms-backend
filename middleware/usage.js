const { supabase } = require("../utils/supabaseClient");

/**
 * Enforces monthly document generation limits.
 * - Unpaid users use DEFAULT_LIMITS (from plan middleware)
 * - Paid users use PLAN_LIMITS
 * - Limit is read from req.limits
 */
const enforceDocumentLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // req.limits is ALWAYS present now (paid or unpaid)
    const limit = req.limits?.documents_per_month;

    // Safety check (should never happen)
    if (typeof limit !== "number") {
      return res.status(500).json({
        error: "Document limits not configured",
      });
    }

    // Start of current month (UTC)
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    // Count usage for this user this month
    const { count, error } = await supabase
      .from("document_usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString());

    if (error) {
      console.error("❌ Document usage count error:", error);
      return res.status(500).json({ error: "Usage check failed" });
    }

    // 🚦 Enforce limit (unpaid OR paid)
    if (count >= limit) {
      return res.status(403).json({
        error: "Document limit reached",
        code: "DOCUMENT_LIMIT_REACHED",
        limit,
        used: count,
        isPaid: req.isPaid,
      });
    }

    // ✅ Under limit — allow request
    next();
  } catch (err) {
    console.error("❌ Document usage middleware error:", err);
    return res.status(500).json({ error: "Usage enforcement failed" });
  }
};

module.exports = { enforceDocumentLimit };
