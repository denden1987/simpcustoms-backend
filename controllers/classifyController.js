const { classifyProduct } = require("../services/aiService");
const { supabase } = require("../services/supabaseClient");

exports.classifyHSCode = async (req, res) => {
  try {
    const { product_description, additional_details } = req.body;

    if (!product_description) {
      return res.status(400).json({
        error: "product_description is required",
      });
    }

    const result = await classifyProduct(
      product_description,
      additional_details || ""
    );

    // 🔽 START HS CODE USAGE LOGGING (NON-BLOCKING)
    try {
      await supabase
        .from("hs_code_usage")
        .insert([
          {
            user_id: req.user.id,
            ip_address: req.ip,
            plan: req.user?.plan || null,
          },
        ]);
    } catch (logError) {
      console.error(
        "HS code usage logging failed:",
        logError.message
      );
    }
    // 🔼 END HS CODE USAGE LOGGING

    // 🔑 NORMALISED RESPONSE (frontend-safe)
    res.json({
      hsCode: result.hsCode || result.code || null,
      confidence: result.confidence || "Medium",
      explanation: result.explanation || result.reason || "",
      dutyRate: result.dutyRate || null,
    });
  } catch (error) {
    console.error("HS classification error:", error);
    res.status(500).json({
      error: "Unable to classify product",
    });
  }
};
