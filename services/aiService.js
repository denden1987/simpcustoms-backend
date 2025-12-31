const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function classifyProduct(productDescription, additionalDetails = "") {
  const prompt = `
You are a customs classification expert.

Based on the product description below, return:
- The most likely 6-digit HS code
- A short explanation
- A confidence level (Low, Medium, High)

Product description:
${productDescription}

Additional details:
${additionalDetails}

Respond ONLY in valid JSON like this:
{
  "hsCode": "6109.10",
  "explanation": "Cotton knitted t-shirts fall under Chapter 61.",
  "confidence": "Medium"
}
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful customs expert." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
  });

  let parsed;

  try {
    parsed = JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error("Failed to parse OpenAI response:", completion.choices[0].message.content);
    throw new Error("Invalid AI response format");
  }

  return {
    hsCode: parsed.hsCode || null,
    explanation: parsed.explanation || "",
    confidence: parsed.confidence || "Medium",
    dutyRate: null, // optional future enhancement
  };
}

module.exports = {
  classifyProduct,
};
