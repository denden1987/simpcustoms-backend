const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.classifyHSCode = async (title, description) => {
  try {
    const prompt = `
You are an expert in global customs classification.

Classify the product below into the most accurate HS Code.

IMPORTANT:
- Respond ONLY with VALID JSON.
- DO NOT add explanations.
- DO NOT add extra text.
- JSON structure must be exactly:

{
  "hs_code": "xxxx.xx",
  "confidence": 0-100,
  "reasoning": "short explanation"
}

Product Title: ${title}
Product Description: ${description}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You always respond in JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    const aiText = response.choices[0].message.content;

    // Parse JSON safely
    return JSON.parse(aiText);

  } catch (error) {
    console.error("AI Error:", error);
    return {
      hs_code: null,
      confidence: 0,
      reasoning: "Error parsing AI response"
    };
  }
};
