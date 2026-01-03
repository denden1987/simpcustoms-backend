const { classifyProduct } = require("../services/aiService");
const { supabase } = require("../supabaseClient");

const HS_CODE_LIMITS = {
  starter: 20,
  business: 100,
  professional: 300,
};

exports.classifyHSCode = async (req, res) => {
  try {
    const { product_description, additional_details } = req.body;

    if (!product_description) {
      return res.status(400).json({
        error: "product_description is required",
      });
    }

    const userEmail = req.headers["x-user-email"];
    console.log("USER EMAIL HEADER:", userEmail);

    if (!userEmail) {
      return res.status(401).json({ error: "Missing user email" });
    }

    // 🔍 Look up user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", userEmail)
      .maybeSingle();

    console.log("USER QUERY RESULT:", { user, userError });

    if (!user) {
      return res.status(403).json({
        error: "User record not found",
      });
    }

    const userId = user.id;

    // 🔍 Look up subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", userId)
      .maybeSingle();

    console.log("SUBSCRIPTION QUERY RESULT:", {
      subscription,
      subError,
    });

    if (!subscription || subscription.status !== "active") {
      return res.status(403).json({
        error: "No active subscription found",
      });
    }

    const plan = subscription.plan?.toLowerCase();
    const monthlyLimit = HS_CODE_LIMITS[plan];

    console.log("PLAN RESOLVED:", plan, "LIMIT:", monthlyLimit);

    if (!monthlyLimit) {
      return res.status(403).json({
        error: "Plan not eligible for HS Code lookup",
      });
    }

    // 📅 Start of current month
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const { count, error: countError } = await supabase
      .from("hs_code_usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString());

    console.log("USAGE COUNT:", count, countError);

    if (count >= monthlyLimit) {
      return res.status(429).json({
        error: "Monthly HS Code limit reached",
      });
    }

    // 🤖 Call AI
    const result = await classifyProduct(
      product_description,
      additional_details || ""
    );

    // 📊 Log usage
    await supabase.from("hs_code_usage").insert([
      {
        user_id: userId,
        ip_address: req.ip,
        endpoint: "/api/classify",
        plan,
      },
    ]);

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
