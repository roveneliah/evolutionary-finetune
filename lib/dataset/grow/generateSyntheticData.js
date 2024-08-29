import { createChatCompletion as createOllamaChatCompletion } from "../../adaptors/ollama.js";
import { createChatCompletion as createOpenAIChatCompletion } from "../../adaptors/chatgpt.js";

const getCreateCompletion = async (provider, messages) =>
  provider === "openai"
    ? createOpenAIChatCompletion
    : provider === "ollama"
    ? createOllamaChatCompletion
    : null;

const throwIfEmptyResponse = (response) => {
  return !response || response.trim() === ""
    ? new Error("Empty response received from the completion API")
    : response;
};

const createCompletion = (provider, messages) =>
  getCreateCompletion(provider)
    .then((createCompletion) => createCompletion({ messages }))
    .then(throwIfEmptyResponse);

const createPromptMessages = async (prompt) => {
  const messages = [
    {
      role: "system",
      content: "You are a helpful assistant that generates training data.",
    },
    { role: "user", content: prompt },
  ];
  return messages;
};

const parseAndFilterJsonl = (jsonlString) => {
  const lines = jsonlString.split("\n");
  console.log(lines);
  return lines
    .filter((line) => line.trim().startsWith("{"))
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        console.warn(`Invalid JSON: ${line}`);
        return null;
      }
    })
    .filter((entry) => entry !== null);
};

export const generateSyntheticData = async ({
  provider = "ollama",
  numExamples = 10,
  prompt,
}) => {
  const messages = await createPromptMessages(prompt);
  const response = await createCompletion(provider, messages);

  console.log("\n\nResponse\n\n");
  console.log(response);
  console.log("\n\n");

  const parsedData = parseAndFilterJsonl(response);
  if (parsedData.length === 0) {
    return new Error(
      "RESPONSE PARSE ERROR: No valid JSON entries found in the response"
    );
  }

  console.log("\n\nParsed data\n\n");
  console.log(parsedData);
  parsedData.forEach((data) => {
    console.log(data);
  });
  console.log("\n\n");

  return parsedData;

  // return response.split("\n").filter((line) => line.trim().startsWith("{"));
};
