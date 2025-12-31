const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Classify product and suggest HS code
 */
async function classifyProduct(product_description, additional_details = "") {
  const prompt = `
You are a customs classification expert.

Product description:
${product_description}

Additional details:
${additional_details}

Return:
- HS Code (6 digits)
- Short explanation
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  return response.choices[0].message.content;
}

module.exports = {
  classifyProduct,
};
