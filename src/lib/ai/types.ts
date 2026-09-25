import { z } from "zod";

export type LLMRole = "system" | "user" | "assistant";

export interface LLMMessage {
  role: LLMRole;
  content: string;
}

export interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LLMGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  seed?: number;
}

export interface LLMResponse {
  text: string;
  finishReason?: string;
  usage?: LLMUsage;
}

export interface StructuredLLMResponse<T> {
  data: T;
  raw: LLMResponse;
  validationSuccess: boolean;
}

/**
 * Provider-agnostic interface for LLM completions.
 * Pluggable: can be backed by Gemini, Anthropic, OpenAI, or a MockProvider.
 */
export interface LLMProvider {
  readonly providerName: string;
  generateText(messages: LLMMessage[], options?: LLMGenerationOptions): Promise<LLMResponse>;
  generateStructured<T>(
    messages: LLMMessage[],
    schema: z.ZodType<T>,
    options?: LLMGenerationOptions
  ): Promise<StructuredLLMResponse<T>>;
}
