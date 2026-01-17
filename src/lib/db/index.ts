/**
 * Database Access Layer - Export all functions
 */

// Conversations
export {
  createConversation,
  getConversation,
  getConversationWithMessages,
  updateConversation,
  updateConversationSchema,
  completeConversation,
  abandonConversation,
  getRecentConversations,
  deleteConversation,
} from './conversations'

// Messages
export {
  addMessage,
  getMessages,
  getRecentMessages,
  getMessage,
  updateMessageMetadata,
  deleteMessage,
  countMessages,
  getLastMessage,
} from './messages'

// Briefs
export {
  createBrief,
  getBrief,
  getBriefByConversation,
  updateBrief,
  deleteBrief,
  getUserBriefs,
} from './briefs'

// Feedback
export {
  createFeedback,
  getFeedbackByConversation,
  getAllFeedback,
  getFeedbackStats,
} from './feedback'
export type { Feedback, CreateFeedbackInput } from './feedback'
