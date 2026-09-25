import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type {
  LLMGenerationOptions,
  LLMMessage,
  LLMProvider,
  LLMResponse,
  StructuredLLMResponse,
} from "./types";

/**
 * Strips markdown code blocks (```json ... ```) and trims whitespace.
 */
export function extractJsonString(rawText: string): string {
  const trimmed = rawText.trim();
  if (trimmed.startsWith("```")) {
    const lines = trimmed.split("\n");
    // Remove first line (```json or ```) and last line (```)
    if (lines.length >= 2 && lines[lines.length - 1].trim().startsWith("```")) {
      return lines.slice(1, -1).join("\n").trim();
    }
  }
  return trimmed;
}

/**
 * GeminiLLMProvider: Official implementation using @google/genai.
 * Adheres to provider independence; communicates strictly via LLMProvider interface.
 */
export class GeminiLLMProvider implements LLMProvider {
  readonly providerName = "gemini";
  private defaultModel: string;

  constructor(defaultModel = "gemini-2.5-flash") {
    this.defaultModel = process.env.GEMINI_MODEL || defaultModel;
  }

  private resolveApiKey(options?: LLMGenerationOptions): string {
    const key =
      options?.apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.AI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!key || key.trim().length === 0 || key.includes("your-ai-api-key")) {
      throw new Error(
        "GEMINI_API_KEY (or AI_API_KEY) is missing. Please configure your Gemini API key in .env.local to execute the agent."
      );
    }
    return key.trim();
  }

  async generateText(
    messages: LLMMessage[],
    options?: LLMGenerationOptions
  ): Promise<LLMResponse> {
    const apiKey = this.resolveApiKey(options);
    const ai = new GoogleGenAI({ apiKey });
    const model = options?.model || this.defaultModel;

    const systemMessage = messages.find((m) => m.role === "system");
    const nonSystemMessages = messages.filter((m) => m.role !== "system");

    const contents = nonSystemMessages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: systemMessage?.content,
        temperature: options?.temperature ?? 0.4,
        maxOutputTokens: options?.maxTokens,
      },
    });

    const text = response.text || "";
    return {
      text,
      finishReason: "stop",
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }

  async generateStructured<T>(
    messages: LLMMessage[],
    schema: z.ZodType<T>,
    options?: LLMGenerationOptions
  ): Promise<StructuredLLMResponse<T>> {
    const apiKey = this.resolveApiKey(options);
    const ai = new GoogleGenAI({ apiKey });
    const model = options?.model || this.defaultModel;

    const systemMessage = messages.find((m) => m.role === "system");
    const nonSystemMessages = messages.filter((m) => m.role !== "system");

    const promptText = nonSystemMessages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const systemInstruction = `${systemMessage?.content || ""}\n\nIMPORTANT: You must return ONLY raw valid JSON conforming to the requested schema. Do not include markdown code blocks or explanations outside of JSON.`;

    // Attempt 1: Primary generation
    const response = await ai.models.generateContent({
      model,
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: options?.temperature ?? 0.2,
        maxOutputTokens: options?.maxTokens,
      },
    });

    const rawText = response.text || "{}";
    const cleanedText = extractJsonString(rawText);

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(cleanedText);
    } catch (parseError) {
      // Bounded retry 1: Repair JSON formatting
      const repairPrompt = `The following output failed JSON parsing:\n"""\n${cleanedText}\n"""\nParse error: ${parseError instanceof Error ? parseError.message : "Invalid JSON"}.\nFix and return ONLY valid JSON.`;

      const repairResponse = await ai.models.generateContent({
        model,
        contents: repairPrompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const repairedText = extractJsonString(repairResponse.text || "{}");
      try {
        parsedJson = JSON.parse(repairedText);
      } catch (secondError) {
        throw new Error(
          `Failed to parse model output as JSON: ${secondError instanceof Error ? secondError.message : "Malformed JSON"}`
        );
      }
    }

    // Validate with Zod
    const validationResult = schema.safeParse(parsedJson);
    if (validationResult.success) {
      return {
        data: validationResult.data,
        raw: {
          text: cleanedText,
          finishReason: "stop",
        },
        validationSuccess: true,
      };
    }

    // Bounded retry 2: Repair schema mismatches
    const validationErrors = JSON.stringify(validationResult.error.format());
    const schemaRepairPrompt = `The JSON data failed validation with the following schema errors:\n${validationErrors}\n\nInvalid JSON was:\n${JSON.stringify(parsedJson, null, 2)}\n\nPlease repair the JSON so every required field is present and correctly typed according to the schema. Return ONLY valid JSON.`;

    const schemaRepairResponse = await ai.models.generateContent({
      model,
      contents: schemaRepairPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const finalCleaned = extractJsonString(schemaRepairResponse.text || "{}");
    const finalParsed = JSON.parse(finalCleaned);
    const finalValidation = schema.safeParse(finalParsed);

    if (!finalValidation.success) {
      throw new Error(
        `Discovery output failed schema validation: ${finalValidation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`
      );
    }

    return {
      data: finalValidation.data,
      raw: {
        text: finalCleaned,
        finishReason: "stop",
      },
      validationSuccess: true,
    };
  }
}

/**
 * OpenAILLMProvider: Fallback provider for OpenAI compatible endpoints.
 */
export class OpenAILLMProvider implements LLMProvider {
  readonly providerName = "openai";
  private defaultModel: string;

  constructor(defaultModel = "gpt-4o-mini") {
    this.defaultModel = process.env.OPENAI_MODEL || defaultModel;
  }

  private resolveApiKey(options?: LLMGenerationOptions): string {
    const key = options?.apiKey || process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    if (!key || key.trim().length === 0 || key.includes("your-ai-api-key")) {
      throw new Error(
        "OPENAI_API_KEY (or AI_API_KEY) is missing. Please configure your OpenAI API key in .env.local to execute the agent."
      );
    }
    return key.trim();
  }

  async generateText(
    messages: LLMMessage[],
    options?: LLMGenerationOptions
  ): Promise<LLMResponse> {
    const apiKey = this.resolveApiKey(options);
    const model = options?.model || this.defaultModel;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.4,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API request failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content || "",
      finishReason: data.choices?.[0]?.finish_reason || "stop",
      usage: data.usage,
    };
  }

  async generateStructured<T>(
    messages: LLMMessage[],
    schema: z.ZodType<T>,
    options?: LLMGenerationOptions
  ): Promise<StructuredLLMResponse<T>> {
    const apiKey = this.resolveApiKey(options);
    const model = options?.model || this.defaultModel;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        response_format: { type: "json_object" },
        temperature: options?.temperature ?? 0.2,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API request failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content || "{}";
    const cleaned = extractJsonString(rawText);
    const parsed = JSON.parse(cleaned);

    const validated = schema.safeParse(parsed);
    if (!validated.success) {
      throw new Error(
        `OpenAI response failed schema validation: ${validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`
      );
    }

    return {
      data: validated.data,
      raw: {
        text: cleaned,
        finishReason: data.choices?.[0]?.finish_reason,
        usage: data.usage,
      },
      validationSuccess: true,
    };
  }
}

/**
 * Factory to retrieve the configured AI provider.
 * Keeps PinkLoom strictly provider-independent and decoupled from vendor SDKs.
 */
let currentProviderInstance: LLMProvider | null = null;

export function getAIProvider(): LLMProvider {
  if (currentProviderInstance) {
    return currentProviderInstance;
  }

  const preferredProvider = process.env.AI_PROVIDER?.toLowerCase();

  if (preferredProvider === "openai" || process.env.OPENAI_API_KEY) {
    currentProviderInstance = new OpenAILLMProvider();
    return currentProviderInstance;
  }

  // Default to Gemini provider
  currentProviderInstance = new GeminiLLMProvider();
  return currentProviderInstance;
}

export function setAIProvider(provider: LLMProvider): void {
  currentProviderInstance = provider;
}
