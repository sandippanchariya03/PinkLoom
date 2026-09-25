import type {
  LLMMessage,
  LLMProvider,
  LLMResponse,
  StructuredLLMResponse,
} from "./types";

/**
 * StubLLMProvider is a Phase 1 structural placeholder.
 * It demonstrates the provider interface contract without fabricating fake AI generation.
 * Live adapters (e.g. Gemini, OpenAI, Anthropic) will be plugged in Phase 2.
 */
export class StubLLMProvider implements LLMProvider {
  readonly providerName = "stub";

  async generateText(messages: LLMMessage[]): Promise<LLMResponse> {
    const lastUserPrompt = messages.filter((m) => m.role === "user").pop()?.content || "";
    return {
      text: `[Phase 1 Stub] Provider received prompt: "${lastUserPrompt.slice(0, 80)}..."`,
      finishReason: "stop",
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }

  async generateStructured<T>(): Promise<StructuredLLMResponse<T>> {
    throw new Error(
      "Structured LLM generation is not implemented in Phase 1. Configure a live provider in Phase 2."
    );
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

  // Phase 1 defaults to the StubLLMProvider
  currentProviderInstance = new StubLLMProvider();
  return currentProviderInstance;
}

export function setAIProvider(provider: LLMProvider): void {
  currentProviderInstance = provider;
}
