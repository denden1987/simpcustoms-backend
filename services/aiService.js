const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.classifyHSCode = async ({ product_description, additional_details }) => {
  const prompt = `
You are a customs classification expert.

Classify the following product and return:
- HS code (6–10 digits if confident)
- Short explanation

Product description:
${product_description}

Additional details:
${additional_details}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert in HS code classification.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
  });

  return response.choices[0].message.content;
};
