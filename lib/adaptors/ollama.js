import fetch from "node-fetch";

export const createChatCompletion = async ({ model = "llama3", messages }) => {
  console.log("\n\nCreating chat completion with Ollama...\n\n");
  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
      );
    }

    const data = await response.json(); // or use await response.text() if it's plain text
    const content = data.message.content;
    // console.log(data.message.content);

    return content;
  } catch (error) {
    throw new Error(`Ollama chat completion failed: ${error.message}`);
  }
};
