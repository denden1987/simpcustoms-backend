const aiService = require("../services/aiService");

exports.classifyProduct = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title && !description) {
      return res.status(400).json({ error: "Missing title or description" });
    }

    const result = await aiService.classifyHSCode(title, description);

    return res.json({
      success: true,
      hs_code: result.hs_code,
      confidence: result.confidence,
      reasoning: result.reasoning
    });

  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
