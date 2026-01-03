const { classifyProduct } = require("../services/aiService");
const { supabase } = require("../supabaseClient");

// 🔢 HS Code monthly limits by plan
const HS_CODE_LIMITS = {
  starter: 20,
  business: 100,
  professional: 300,
};

exports.classifyHSCode = async (req, res) => {
  try {
    const { product_description, additional_details } = req.body;

    // 🔒 Validation
    if (!product_description) {
      return res.status(400).json({
        error: "product_description is required",
      });
    }

    const userId = req.user?.id;
    const plan = req.user?.plan;

    // 🚫 Free users = no HS Code access
    if (!plan || !HS_CODE_LIMITS[plan]) {
      return res.status(403).json({
        error: "HS Code lookup is not available on your current plan.",
      });
    }

    const monthlyLimit = HS_CODE_LIMITS[plan];

    // 📅 Start of current month (UTC)
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    // 🔍 Count HS Code usage this month
    const { count, error: countError } = await supabase
      .from("hs_code_usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString());

    if (countError) {
      console.error("HS code usage count failed:", countError.message);
      return res.status(500).json({
        error: "Unable to verify HS Code usage",
      });
    }

    // ⛔ Limit reached → block BEFORE OpenAI
    if (count >= monthlyLimit) {
      return res.status(429).json({
        error:
          "You have reached your monthly HS Code lookup limit. Please upgrade your plan to continue.",
      });
    }

    // 🤖 Call AI (safe to proceed)
    const result = await classifyProduct(
      product_description,
      additional_details || ""
    );

    // 📊 Log successful usage (non-blocking)
    try {
      await supabase.from("hs_code_usage").insert([
        {
          user_id: userId,
          ip_address: req.ip,
          endpoint: "/api/classify",
          plan,
        },
      ]);
    } catch (logError) {
      console.error("HS code usage logging failed:", logError.message);
    }

    // 🔑 Normalised response
    return res.json({
      hsCode: result.hsCode || result.code || null,
      confidence: result.confidence || "Medium",
      explanation: result.explanation || result.reason || "",
      dutyRate: result.dutyRate || null,
    });
  } catch (error) {
    console.error("HS classification error:", error);
    return res.status(500).json({
      error: "Unable to classify product",
    });
  }
};
