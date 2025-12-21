const { supabase } = require("../utils/supabaseClient");
const { PLAN_LIMITS, DEFAULT_LIMITS } = require("../config/planLimits");

const attachPlan = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan_key, status")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    // Ignore "no rows" error
    if (error && error.code !== "PGRST116") {
      console.error("❌ Subscription lookup error:", error);
      return res.status(500).json({ error: "Subscription lookup failed" });
    }

    // 🆓 UNPAID USER
    if (!data) {
      req.plan = null;
      req.limits = DEFAULT_LIMITS;
      req.isPaid = false;
      return next();
    }

    // 💳 PAID USER
    const planKey = data.plan_key;

    req.plan = planKey;
    req.limits = PLAN_LIMITS[planKey];
    req.isPaid = true;

    next();
  } catch (err) {
    console.error("❌ Plan middleware error:", err);
    return res.status(500).json({ error: "Plan resolution failed" });
  }
};

module.exports = { attachPlan };
