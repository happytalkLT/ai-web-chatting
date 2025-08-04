export interface GeminiTextPart {
  text: string;
}

export interface GeminiFunctionCall {
  name: string;
  args: Record<string, any>;
}

export interface GeminiFunctionCallPart {
  functionCall: GeminiFunctionCall;
}

export type GeminiPart = GeminiTextPart | GeminiFunctionCallPart;

export interface GeminiContent {
  parts: GeminiPart[];
  role: 'model' | 'user';
}

export interface GeminiCandidate {
  content: GeminiContent;
  finishReason: string;
  avgLogprobs?: number;
}

export interface GeminiTokenDetails {
  modality: string;
  tokenCount: number;
}

export interface GeminiUsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
  promptTokensDetails?: GeminiTokenDetails[];
  candidatesTokensDetails?: GeminiTokenDetails[];
}

export interface GeminiApiResponse {
  candidates: GeminiCandidate[];
  usageMetadata: GeminiUsageMetadata;
  modelVersion: string;
  responseId: string;
  functionCallDetected?: boolean;
  functionCall?: GeminiFunctionCall;
}