const { classifyProduct } = require("../services/aiService");
const { supabase } = require("../supabaseClient");

exports.classifyHSCode = async (req, res) => {
  try {
    const { product_description, additional_details } = req.body;

    // 🔒 Validation
    if (!product_description) {
      return res.status(400).json({
        error: "product_description is required",
      });
    }

    // 🤖 Call AI service
    const result = await classifyProduct(
      product_description,
      additional_details || ""
    );

    // 🧪 HS CODE USAGE LOGGING — DEBUG MODE
    try {
      const payload = {
        user_id: req.user?.id || null,
        ip_address: req.ip,
        endpoint: "/api/classify",
        plan: req.user?.plan || null,
      };

      console.log("HS CODE USAGE PAYLOAD:", payload);

      const { data, error } = await supabase
        .from("hs_code_usage")
        .insert([payload])
        .select();

      console.log("HS CODE USAGE INSERT RESULT:", { data, error });
    } catch (logError) {
      console.error("HS code usage logging threw error:", logError);
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
