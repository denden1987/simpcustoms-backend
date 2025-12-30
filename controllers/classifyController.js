const { classifyHSCode } = require("../services/aiService");

exports.classify = async (req, res) => {
  try {
    const { product_description, additional_details } = req.body;

    if (!product_description) {
      return res.status(400).json({
        error: "product_description is required"
      });
    }

    const result = await classifyHSCode(
      product_description,
      additional_details || ""
    );

    return res.json(result);
  } catch (error) {
    console.error("HS classification error:", error);
    return res.status(500).json({
      error: "Failed to classify product"
    });
  }
};
