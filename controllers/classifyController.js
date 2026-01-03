const { classifyProduct } = require("../services/aiService");
const { supabase } = require("../supabaseClient");

// 🔢 Monthly HS Code limits by plan
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

    // 🔐 Base44 user identity
    const userEmail = req.headers["x-user-email"];

    if (!userEmail) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 🔍 Look up user in Supabase Auth (ADMIN, v2-compatible)
    const {
      data: userList,
      error: listError,
    } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
      email: userEmail,
    });

    if (listError || !userList?.users?.length) {
      console.error("Auth user lookup failed:", listError);
      return res.status(403).json({
        error: "Authenticated user not found",
      });
    }

    const authUser = userList.users[0];
    const userId = authUser.id;

    // 📦 Fetch active subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (subError || !subscription) {
      return res.status(403).json({
        error: "HS Code lookup is not available on your current plan.",
      });
    }

    const plan = subscription.plan?.toLowerCase();
    const monthlyLimit = HS_CODE_LIMITS[plan];

    if (!monthlyLimit) {
      return res.status(403).json({
        error: "HS Code lookup is not available on your current plan.",
      });
    }

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
      console.error("Usage count failed:", countError.message);
      return res.status(500).json({
        error: "Unable to verify HS Code usage",
      });
    }

    // ⛔ Limit reached
    if (count >= monthlyLimit) {
      return res.status(429).json({
        error:
          "You have reached your monthly HS Code lookup limit. Please upgrade your plan to continue.",
      });
    }

    // 🤖 Call AI
    const result = await classifyProduct(
      product_description,
      additional_details || ""
    );

    // 📊 Log usage (non-blocking)
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
      console.error("Usage logging failed:", logError.message);
    }

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
