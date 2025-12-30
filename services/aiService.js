const OpenAI = require("openai");

/**
 * DEBUG: confirm OpenAI key exists at runtime
 * This will show up in Railway logs
 */
console.log("OPENAI KEY PRESENT:", !!process.env.OPENAI_API_KEY);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.classifyHSCode = async (
  title = "",
  description = "",
  additionalDetails = ""
) => {
  try {
    // Safety check — do not even call AI if description is missing
    if (!description || description.trim().length < 10) {
      return {
        hs_code: null,
        confidence: 0,
        reasoning: "Insufficient product description"
      };
    }

    const prompt = `
You are a customs classification expert.

Your task is to determine the most accurate HS Code for the product below.

STRICT RULES:
- Respond ONLY with valid JSON
- Do NOT include markdown
- Do NOT include explanations outside JSON
- JSON MUST match this structure exactly:

{
  "hs_code": "xxxx.xx",
  "confidence": 0-100,
  "reasoning": "short explanation"
}

Product Title:
${title || "N/A"}

Product Description:
${description}

Additional Details:
${additionalDetails || "None"}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You respond with JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2
    });

    const rawText = response.choices?.[0]?.message?.content || "";

    // 🔍 CRITICAL DEBUG LOG — THIS IS WHAT WE NEED TO SEE
    console.log("RAW AI RESPONSE:", rawText);

    // Extract JSON safely even if model adds text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("AI response did not contain JSON");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Final validation
    if (!parsed.hs_code) {
      return {
        hs_code: null,
        confidence: 0,
        reasoning: "AI could not confidently classify the product"
      };
    }

    return {
      hs_code: parsed.hs_code,
      confidence: parsed.confidence || 0,
      reasoning: parsed.reasoning || "No reasoning provided"
    };

  } catch (error) {
    console.error("HS CLASSIFICATION ERROR:", error);

    return {
      hs_code: null,
      confidence: 0,
      reasoning: "Unable to classify the product"
    };
  }
};
