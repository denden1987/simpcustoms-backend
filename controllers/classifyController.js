const { classifyProduct } = require("../services/aiService");
const { supabase } = require("../supabaseClient");

// 🔢 Monthly HS Code limit (Business plan for now)
const MONTHLY_HS_CODE_LIMIT = 100;

exports.classifyHSCode = async (req, res) => {
  try {
    const { product_description, additional_details } = req.body;

    // 🔒 Basic validation
    if (!product_description) {
      return res.status(400).json({
        error: "product_description is required",
      });
    }

    // 🔐 User identity provided by Base44
    const userEmail = req.headers["x-user-email"];
    if (!userEmail) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 🔍 Resolve user in Supabase Auth (admin)
    const { data: users, error: userError } =
      await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1,
        email: userEmail,
      });

    if (userError || !users?.users?.length) {
      return res.status(403).json({ error: "User not found" });
    }

    const userId = users.users[0].id;

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
    if (count >= MONTHLY_HS_CODE_LIMIT) {
      return res.status(429).json({
        error:
          "You have reached your monthly HS Code lookup limit. Please upgrade to continue.",
      });
    }

    // 🤖 Call AI (safe to proceed)
    const result = await classifyProduct(
      product_description,
      additional_details || ""
    );

    // 📊 Log usage (non-blocking, cost-safe)
    try {
      await supabase.from("hs_code_usage").insert([
        {
          user_id: userId,
          ip_address: req.ip,
          endpoint: "/api/classify",
          plan: "business",
        },
      ]);
    } catch (logError) {
      console.error("HS code usage logging failed:", logError.message);
    }

    // ✅ Response
    return res.json({
      hsCode: result.hsCode || null,
      confidence: result.confidence || "Medium",
      explanation: result.explanation || "",
      dutyRate: null,
    });
  } catch (error) {
    console.error("HS classification error:", error);
    return res.status(500).json({
      error: "Unable to classify product",
    });
  }
};
