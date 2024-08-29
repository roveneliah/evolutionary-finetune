const validateFormat = (data) => {
  const hasMessages = Array.isArray(data.messages);
  const hasValidMessages =
    hasMessages &&
    data.messages.every(
      (msg) =>
        typeof msg === "object" &&
        ["system", "user", "assistant"].includes(msg.role) &&
        typeof msg.content === "string" &&
        (msg.role !== "assistant" || typeof msg.weight === "number")
    );

  return hasMessages && hasValidMessages;
};

export { validateFormat };
