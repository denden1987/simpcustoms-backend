const aiService = require("../services/aiService");
const { recordHsLookup } = require("../services/usageService");

exports.classifyProduct = async (req, res) => {
  try {
    const { product_description, additional_details = "" } = req.body;

    if (!product_description) {
      return res.status(400).json({
        error: "product_description is required",
      });
    }

    // 🔍 Capture IP (works behind Railway proxy)
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    // 🔐 Record usage (non-blocking)
    recordHsLookup(ipAddress);

    const result = await aiService.classifyHSCode({
      product_description,
      additional_details,
    });

    return res.status(200).json({
      success: true,
      classification: result,
    });
  } catch (err) {
    console.error("HS classification error:", err);

    return res.status(500).json({
      error: "Internal server error during HS classification",
    });
  }
};
