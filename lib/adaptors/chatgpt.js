import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const handleOpenAIResponse = (response) => {
  if (response.choices && response.choices.length > 0) {
    return response.choices[0].message.content;
  }
  throw new Error("Unexpected response format from OpenAI");
};

export const createChatCompletion = async ({
  messages,
  stream = false,
  params = {},
}) => {
  try {
    const response = await client.chat.completions.create({
      model: params.model,
      messages,
      stream,
      ...params,
    });
    return handleOpenAIResponse(response);
  } catch (error) {
    throw new Error(`Chat completion failed: ${error.message}`);
  }
};
