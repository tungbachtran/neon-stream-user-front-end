import { apiClient } from "./client"; 
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'USER' | 'ADMIN';
  content: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  userId: string;
  adminId?: string | null;
  status: 'ACTIVE' | 'CLOSED';
  updatedAt: string;
  createdAt: string;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  total: number;
  page: number;
  pages: number;
}

export const chatApi = {
  /** Lấy hoặc tạo conversation của user hiện tại */
  getConversation: (): Promise<ChatConversation> =>
    apiClient.get('/chat/conversation'),

  /** Lấy tin nhắn phân trang */
  getMessages: (
    conversationId: string,
    page = 1,
    limit = 20,
  ): Promise<MessagesResponse> =>
    apiClient
      .get(`/chat/conversation/${conversationId}/messages`, {
        params: { page, limit },
      })
};
