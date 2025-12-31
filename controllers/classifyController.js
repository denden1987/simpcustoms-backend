// controllers/classifyController.js
const { classifyProduct } = require("../services/aiService");
const { recordHSCodeUsage } = require("../services/usageService");

async function classifyHSCode(req, res) {
  try {
    const { product_description, additional_details = "" } = req.body;

    if (!product_description) {
      return res.status(400).json({
        error: "product_description is required"
      });
    }

    const result = await classifyProduct(
      product_description,
      additional_details
    );

    // fire-and-forget usage tracking
    recordHSCodeUsage(req).catch(() => {});

    res.json({
      success: true,
      result
    });
  } catch (err) {
    console.error("HS classification error:", err);
    res.status(500).json({
      error: "Unable to classify product"
    });
  }
}

module.exports = {
  classifyHSCode
};
