const aiService = require("../services/aiService");

exports.classifyProduct = async (req, res) => {
  try {
    // Accept multiple field name variants (frontend-agnostic)
    const title =
      req.body.title ||
      req.body.product_title ||
      "";

    const description =
      req.body.description ||
      req.body.product_description ||
      "";

    const additionalDetails =
      req.body.additionalDetails ||
      req.body.additional_details ||
      "";

    // Require at least a description to classify safely
    if (!description) {
      return res.status(400).json({
        error: "Missing product description"
      });
    }

    // Call AI classification logic
    const result = await aiService.classifyHSCode(
      title,
      description,
      additionalDetails
    );

    return res.json({
      success: true,
      hs_code: result.hs_code,
      confidence: result.confidence,
      reasoning: result.reasoning
    });

  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json({
      error: "Server error"
    });
  }
};
