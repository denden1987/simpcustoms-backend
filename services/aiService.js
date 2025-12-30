const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.classifyHSCode = async (title, description, additionalDetails = "") => {
  try {
    const prompt = `
You are an expert in global customs classification.

Classify the product below into the most accurate HS Code.

IMPORTANT:
- Respond ONLY with VALID JSON.
- DO NOT add explanations outside the JSON.
- JSON structure must be exactly:

{
  "hs_code": "xxxx.xx",
  "confidence": 0-100,
  "reasoning": "short explanation"
}

Product Title: ${title || "N/A"}
Product Description: ${description}

Additional Details:
${additionalDetails || "None"}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You respond with JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2
    });

    const aiText = response.choices[0].message.content;

    // 🔍 TEMP DEBUG LOG (keep for now)
    console.log("RAW AI RESPONSE:", aiText);

    // ✅ Safer JSON extraction
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error("AI Error:", error);
    return {
      hs_code: null,
      confidence: 0,
      reasoning: "Unable to classify with provided information"
    };
  }
};
