/**
 * AI Module - Export all functions
 */

export {
  generateAIResponse,
  generateStarterMessage,
  generateBrief,
  testConnection,
  processUserInput,
  processUserInputStreaming,
  extractSchemaFromInput,
  handleQuestionAnswer,
} from './qwen'

export {
  SYSTEM_PROMPT,
  getStatePrompt,
  SCHEMA_EXTRACTION_PROMPT,
  BRIEF_GENERATION_PROMPT,
  FEW_SHOT_EXAMPLES,
  CONVERSATION_STARTER,
  ERROR_RECOVERY_PROMPT,
} from './prompts'
