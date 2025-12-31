const { classifyHSCode } = require("../services/aiService");

exports.classifyProduct = async (req, res) => {
  try {
    console.log("🔵 /api/classify called");
    console.log("🔵 Request body:", req.body);

    const { product_description, additional_details } = req.body;

    if (!product_description) {
      console.log("🔴 Missing product_description");
      return res.status(400).json({ error: "product_description is required" });
    }

    console.log("🟡 Calling AI service...");

    const result = await classifyHSCode(
      product_description,
      additional_details || ""
    );

    console.log("🟢 AI result:", result);

    return res.json(result);
  } catch (err) {
    console.error("🔥 CLASSIFY ERROR:", err);
    console.error("🔥 STACK:", err.stack);

    return res.status(500).json({
      error: "Classification failed",
      details: err.message,
    });
  }
};
