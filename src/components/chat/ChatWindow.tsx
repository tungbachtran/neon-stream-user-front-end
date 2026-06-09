'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { X, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { userChatSocket } from '@/lib/socket/chat.socket';
import { useUserChatSocket, useUserConversation, useUserMessages } from '@/lib/hooks/useChat';

interface Props {
  userId: string;
  onClose: () => void;
}

export function ChatWindow({ userId, onClose }: Props) {
  const [page, setPage] = useState(1);
  const [input, setInput] = useState('');
  const [adminTyping, setAdminTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>();

  // ── Data ──
  const { data: conversation, isLoading: loadingConv } = useUserConversation();
  const { data: msgData, isLoading: loadingMsgs } = useUserMessages(
    conversation?.id,
    page,
  );
  const { sendMessage, sendTyping } = useUserChatSocket(
    userId,
    conversation?.id,
  );

  const messages = msgData?.messages || [];
  const totalPages = msgData?.pages || 1;

  // ── Lắng nghe admin typing + conversation closed ──
  useEffect(() => {
    if (!conversation?.id) return;
    const socket = userChatSocket.instance;
    if (!socket) return;

    const onAdminTyping = () => {
      setAdminTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setAdminTyping(false), 3000);
    };

    const onClosed = () => {
      toast.info('Conversation has been closed by support');
      setTimeout(onClose, 1500);
    };

    const onAdminJoined = () => {
      toast.success('Support agent joined the chat');
    };

    socket.on('admin:typing', onAdminTyping);
    socket.on('conversation:closed', onClosed);
    socket.on('admin:joined', onAdminJoined);

    return () => {
      socket.off('admin:typing', onAdminTyping);
      socket.off('conversation:closed', onClosed);
      socket.off('admin:joined', onAdminJoined);
    };
  }, [conversation?.id, onClose]);

  // ── Auto scroll xuống tin mới nhất ──
  useEffect(() => {
    if (page === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, page]);

  // ── Gửi tin nhắn ──
  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
    // Reset về page 1 để thấy tin mới
    setPage(1);
  }, [input, sendMessage]);

  const handleTyping = () => {
    sendTyping();
  };

  // ── Loading state ──
  if (loadingConv) {
    return (
      <div className="fixed bottom-24 right-6 w-96 h-[480px] bg-card border border-border rounded-2xl shadow-2xl flex items-center justify-center z-50">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[480px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-violet-600/10">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold">Support Chat</span>
          {conversation?.adminId && (
            <span className="text-xs text-muted-foreground">
              · Agent online
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
        {/* Load tin cũ hơn */}
        {page < totalPages && (
          <button
            className="text-xs text-violet-400 hover:underline mx-auto py-1"
            onClick={() => setPage((p) => p + 1)}
          >
            ↑ Load older messages
          </button>
        )}

        {loadingMsgs && page === 1 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground text-sm gap-2">
            <span className="text-4xl">💬</span>
            <p>Send a message to start</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.senderRole === 'USER';
            return (
              <div
                key={msg.id}
                className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
              >
                {!isUser && (
                  <Avatar className="h-6 w-6 mr-2 shrink-0 mt-1">
                    <AvatarFallback className="bg-violet-600 text-white text-xs">
                      A
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[72%] rounded-2xl px-3 py-2 text-sm',
                    isUser
                      ? 'bg-violet-600 text-white rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm',
                  )}
                >
                  <p className="break-words">{msg.content}</p>
                  <p
                    className={cn(
                      'text-[10px] mt-0.5',
                      isUser ? 'text-violet-200' : 'text-muted-foreground',
                    )}
                  >
                    {format(new Date(msg.createdAt), 'HH:mm')}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Admin typing indicator */}
        {adminTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 flex gap-1">
              {[0, 100, 200].map((d) => (
                <div
                  key={d}
                  className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="text-sm"
          />
          <Button
            size="icon"
            className="bg-violet-600 hover:bg-violet-700 shrink-0"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
