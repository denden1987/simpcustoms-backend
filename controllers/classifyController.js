const { classifyProduct } = require("../services/aiService");

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
