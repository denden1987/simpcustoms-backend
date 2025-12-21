/**
 * Blocks access to paid (AI / cost-incurring) features
 * unless the user has an active paid subscription.
 */
const requirePaidPlan = (req, res, next) => {
  try {
    // attachPlan middleware MUST run before this
    if (!req.isPaid) {
      return res.status(403).json({
        error: "Upgrade required to access this feature",
        code: "UPGRADE_REQUIRED",
      });
    }

    next();
  } catch (err) {
    console.error("❌ Paid plan enforcement error:", err);
    return res.status(500).json({ error: "Access check failed" });
  }
};

module.exports = { requirePaidPlan };
