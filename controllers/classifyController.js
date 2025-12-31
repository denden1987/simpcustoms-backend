const { classifyProduct } = require("../services/aiService");

async function classifyHSCode(req, res) {
  try {
    const { product_description, additional_details } = req.body;

    if (!product_description) {
      return res.status(400).json({
        error: "Product description is required",
      });
    }

    const result = await classifyProduct({
      product_description,
      additional_details: additional_details || "",
    });

    return res.json(result);
  } catch (error) {
    console.error("HS Code classification error:", error);
    return res.status(500).json({
      error: "Unable to classify product",
    });
  }
}

module.exports = {
  classifyHSCode,
};
