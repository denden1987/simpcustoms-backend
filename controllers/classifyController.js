const { classifyProduct } = require("../services/aiService");
const { supabase } = require("../supabaseClient");

// 🔢 Monthly HS Code limits
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

    // 🧪 DEBUG — LOG HEADERS (CRITICAL)
    console.log("REQ HEADERS:", JSON.stringify(req.headers, null, 2));

    // TEMP: allow request to continue so we can see headers
    return res.status(403).json({
      error: "Debugging headers — check Railway logs",
    });
  } catch (error) {
    console.error("HS classification error:", error);
    return res.status(500).json({
      error: "Unable to classify product",
    });
  }
};
