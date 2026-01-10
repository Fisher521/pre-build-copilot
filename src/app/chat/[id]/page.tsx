/**
 * Chat Page
 * Dynamic route for conversation pages with schema support
 */

import { notFound } from 'next/navigation'
import { getConversationWithMessages } from '@/lib/db/conversations'
import { ChatContainer } from '@/components/chat/ChatContainer'

interface ChatPageProps {
  params: Promise<{ id: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params

  // Fetch conversation with messages
  const conversation = await getConversationWithMessages(id)

  if (!conversation) {
    notFound()
  }

  return (
    <ChatContainer
      conversationId={conversation.id}
      initialMessages={conversation.messages}
      initialSchema={conversation.schema_data}
    />
  )
}
