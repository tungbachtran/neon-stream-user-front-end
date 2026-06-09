"use client";
import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { userChatSocket } from "../socket/chat.socket"; 
import { chatApi, ChatMessage, MessagesResponse } from "../api/chat";

// ── Lấy / tạo conversation ───────────────────────────────

export function useUserConversation() {
  return useQuery({
    queryKey: ["chat", "conversation"],
    queryFn: chatApi.getConversation,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Lấy messages phân trang ──────────────────────────────

export function useUserMessages(conversationId?: string, page = 1) {
  return useQuery({
    queryKey: ["chat", "messages", conversationId, page],
    queryFn: () => chatApi.getMessages(conversationId!, page, 20),
    enabled: !!conversationId,
    staleTime: 30_000,
  });
}

// ── Socket: kết nối, join room, nhận message mới ─────────

export function useUserChatSocket(userId?: string, conversationId?: string) {
  const qc = useQueryClient();
  const joinedRef = useRef(false);

  // Kết nối socket 1 lần khi có userId
  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("access_token") || "";
    userChatSocket.connect(token);

    return () => {
      // Không disconnect ở đây để tránh reconnect liên tục
      // Chỉ disconnect khi unmount toàn bộ app (ChatButton bị remove)
    };
  }, [userId]);

  // Join conversation room khi có conversationId
  useEffect(() => {
    if (!userId || !conversationId) return;
    const socket = userChatSocket.instance;
    if (!socket) return;

    const doJoin = () => {
      if (!joinedRef.current) {
        socket.emit("user:join", { userId });
        joinedRef.current = true;
      }
    };

    if (socket.connected) {
      doJoin();
    } else {
      socket.once("connect", doJoin);
    }

    // Nhận tin nhắn mới → cập nhật cache optimistically
    const onMessage = (msg: ChatMessage) => {
      qc.setQueryData<MessagesResponse>(
        ["chat", "messages", conversationId, 1],
        (old) => {
          // ✅ Khởi tạo cache mới nếu chưa có
          if (!old) return { messages: [msg], total: 1, page: 1, pages: 1 };
          const exists = old.messages.some((m) => m.id === msg.id);
          if (exists) return old;
          return { ...old, messages: [...old.messages, msg] };
        }
      );
    };
    

    socket.on("message:new", onMessage);

    return () => {
      socket.off("message:new", onMessage);
      socket.off("connect", doJoin);
    };
  }, [userId, conversationId, qc]);

  // Gửi tin nhắn qua socket
  const sendMessage = (content: string) => {
    if (!conversationId) return;
    userChatSocket.instance?.emit("user:send-message", {
      conversationId,
      content,
    });
  };

  // Gửi typing indicator
  const sendTyping = () => {
    if (!conversationId) return;
    userChatSocket.instance?.emit("user:typing", { conversationId });
  };

  return { sendMessage, sendTyping };
}
