import { z } from "zod";

export const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
  weight: z.number().optional(),
});

export const EntrySchema = z.object({
  messages: z
    .array(MessageSchema)
    .refine(
      (messages) =>
        messages[0].role === "system" &&
        messages[1].role === "user" &&
        messages[2].role === "assistant",
      {
        message: "Messages must be in the order: system, user, assistant",
      }
    ),
});
