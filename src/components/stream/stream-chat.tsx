// src/components/stream/stream-chat.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Trash2, Smile, Gift, Users, Settings, Zap } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

import { useAppSelector } from '@/types/redux-type';
import { DonateTier } from '@/lib/api/donate';
import { DonateChatBubble } from '../donate/donate-chat-bubble';
import { DonatePanel } from '../donate/donate-panel';
import { API_BASE_URL } from '@/lib/api/config';

interface StreamChatProps {
  roomId: string;
  isModerator?: boolean;
}

interface Message {
  messageId: string;
  content: string;
  roomId: string;
  userId: string;
  status: 'PENDING' | 'VISIBLE' | 'FLAGGED' | 'WARNED';
  createdAt: string;
  user?: { id: string; username: string; avatar: string | null; role: string };
  // ✅ Donate fields
  isDonate?: boolean;
  donateData?: {
    diamonds: number;
    tier: DonateTier;
    message: string | null;
  };
}

interface Punishment {
  userId: string;
  type: 'WARN' | 'MUTE' | 'BAN';
  reason: string;
  duration: number | null;
}

export function StreamChat({ roomId, isModerator = false }: StreamChatProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [myPunishment, setMyPunishment] = useState<Punishment | null>(null);
  const [showDonatePanel, setShowDonatePanel] = useState(false);
  useEffect(() => {
    const newSocket = io(`${API_BASE_URL}/chat`, {
      withCredentials: true,
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat');
      newSocket.emit('join_room', { roomId, userId: user?.id });
    });

    newSocket.on('chat_history', (history: any[]) => {
      const normalized: Message[] = history.map((m) => ({
        messageId: m.id || m.messageId,
        content: m.content,
        roomId: m.roomId,
        userId: m.userId,
        status: m.status,
        createdAt: m.createdAt,
        user: m.user,
      }));

      setMessages(normalized);
    });

    newSocket.on('new_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('message_removed', ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.messageId !== messageId));
    });

    newSocket.on('message_approved', ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === messageId ? { ...m, status: 'VISIBLE' } : m,
        ),
      );
    });

    newSocket.on('message_warned', ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === messageId ? { ...m, status: 'WARNED' } : m,
        ),
      );
    });

    newSocket.on('message_flagged', ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === messageId
            ? { ...m, status: 'FLAGGED' }
            : m,
        ),
      );
    });

    newSocket.on('user_punished', (punishment: Punishment) => {
      if (punishment.userId === user?.id) {
        setMyPunishment(punishment);
        // Tự clear sau duration
        if (punishment.duration) {
          setTimeout(() => setMyPunishment(null), punishment.duration * 1000);
        }
      }
    });

    newSocket.on('error', (error: any) => {
      console.error('Chat error:', error);
    });

    setSocket(newSocket);
    const donateSocket = io(
      `${API_BASE_URL}/donate`,
      { withCredentials: true, transports: ['websocket'] },
    );

    donateSocket.on('connect', () => {
      donateSocket.emit('join_donate_room', { roomId });
    });

    donateSocket.on('donate_alert', (alert: any) => {
      const donateMsg: Message = {
        messageId: alert.txnId,
        content: alert.message ?? '',
        roomId,
        userId: alert.sender.id,
        status: 'VISIBLE',
        createdAt: alert.createdAt,
        user: {
          id: alert.sender.id,
          username: alert.sender.username,
          avatar: alert.sender.avatar,
          role: 'VIEWER',
        },
        isDonate: true,
        donateData: {
          diamonds: alert.diamonds,
          tier: alert.tier,
          message: alert.message,
        },
      };
      setMessages((prev) => [...prev, donateMsg]);
    });
    return () => {
      newSocket.disconnect();
      donateSocket.disconnect();
    };
  }, [roomId, user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !socket || !user) return;

    socket.emit('send_message', {
      roomId,
      userId: user.id,
      content: inputValue.trim(),
    });

    setInputValue('');
  };

  const handleRemoveMessage = (messageId: string) => {
    if (!socket) return;

    socket.emit('remove_message', {
      messageId,
      roomId,
      moderatorId: user?.id,
    });
  };

  return (
    <aside className="h-[calc(100vh-32px)] min-h-[720px] overflow-hidden border-l border-white/5 bg-[#111114] text-white shadow-2xl lg:sticky lg:top-4">
      <div className="flex h-full flex-col">
        <div className="flex h-[64px] items-center justify-between border-b border-white/5 px-5">
          <h2 className="text-sm font-black uppercase tracking-[0.22em] text-white/85">
            Live Chat
          </h2>

          <div className="flex items-center gap-3 text-white/60">
            <Users className="h-4 w-4" />
            <Settings className="h-4 w-4" />
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
        >
          <div className="mb-4 text-[10px] font-extrabold uppercase tracking-wide text-white/35">
            Welcome to the chat room!
          </div>

          <div className="space-y-4">
            <div className="text-sm leading-relaxed">
              <span className="font-bold text-cyan-400">Mod_Luna:</span>{' '}
              <span className="text-white/75">
                Please keep the chat respectful everyone! Let&apos;s go Viper! 🔥
              </span>
            </div>

            {messages.map((message) => (
              message.isDonate && message.donateData ? (
                <DonateChatBubble
                  key={message.messageId}
                  senderUsername={message.user?.username ?? 'Anonymous'}
                  diamonds={message.donateData.diamonds}
                  tier={message.donateData.tier}
                  message={message.donateData.message}
                  createdAt={message.createdAt}
                />
              ) : (
                <div
                  key={message.messageId}
                  className={`group flex items-start gap-2 text-sm leading-relaxed transition-opacity duration-500 ${message.status === 'FLAGGED' ? 'opacity-30' : 'opacity-100'
                    }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[#8b6cff]">
                      {message.user?.username || 'Anonymous'}:
                    </span>{' '}

                    {message.status === 'FLAGGED' && (
                      <Badge className="mr-1 rounded-full bg-red-500/20 px-2 py-0 text-[10px] text-red-400">
                        Removed
                      </Badge>
                    )}

                    <span className="break-words text-white/75">{message.content}</span>
                  </div>
                </div>
              )

            ))}

            {myPunishment && (
              <div className={`mx-5 mb-3 rounded-xl p-3 text-sm font-bold ${myPunishment.type === 'BAN' ? 'bg-red-500/20 text-red-300' :
                myPunishment.type === 'MUTE' ? 'bg-orange-500/20 text-orange-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                {myPunishment.type === 'BAN' && '🚫 '}
                {myPunishment.type === 'MUTE' && '🔇 '}
                {myPunishment.type === 'WARN' && '⚠️ '}
                {myPunishment.reason}
                {myPunishment.duration && ` (${myPunishment.duration / 60} phút)`}
              </div>
            )}

            <div className="rounded-xl border border-pink-400/20 bg-pink-500/10 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-pink-400 text-[#160b12]">
                  <Gift className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-pink-300">
                    Gift Alert
                  </p>
                  <p className="text-sm font-semibold text-white/80">
                    StarGazer gifted 5 subs!
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm leading-relaxed">
              <span className="font-bold text-violet-400">EliteGamer_01:</span>{' '}
              <span className="font-semibold text-white/80">
                VIPER IS THE GOAT 🐍🐍🐍
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 bg-[#1b1b20] p-4">
          <div className="flex items-center gap-2 rounded-xl bg-black px-3 py-2 shadow-inner">
            <Input
              placeholder="Send a message"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={!user}
              className="h-9 border-0 bg-transparent px-0 text-sm text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <Smile className="h-4 w-4 shrink-0 text-white/50" />

            <Button
              onClick={handleSendMessage}
              disabled={!user || !inputValue.trim()}
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full bg-transparent text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300 disabled:opacity-30"
            >
              <Send className="h-4 w-4 fill-current" />
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/35">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[11px]">
                $
              </span>
              <span>250 Points</span>
            </div>

            <Button className="h-7 rounded-full bg-pink-400 px-5 text-xs font-black uppercase text-[#241018] hover:bg-pink-300">
              Gift
            </Button>
            {/* ✅ Nút Donate — tách riêng */}
            <Button
              onClick={() => setShowDonatePanel(true)}
              disabled={!user}
              className="h-7 rounded-full bg-yellow-400 px-5 text-xs font-black uppercase text-[#1a1500] hover:bg-yellow-300 disabled:opacity-40"
            >
              <Zap className="mr-1 h-3 w-3" />
              Donate
            </Button>
          </div>

          {showDonatePanel && (
            <DonatePanel
              streamId={roomId}
              onClose={() => setShowDonatePanel(false)}
            />
          )}

          <div className="mt-6 border-t border-white/5 pt-5">
            <h3 className="mb-4 text-[11px] font-black uppercase tracking-[0.24em] text-white/35">
              Recommended Streams
            </h3>

            <div className="space-y-3">
              <RecommendedStream
                title="Retro Night: Classic RPGs"
                streamer="PixelMistress"
                viewers="12.5K"
                imageClass="from-cyan-500/50 via-blue-500/20 to-violet-500/30"
              />

              <RecommendedStream
                title="Character Design Workshop"
                streamer="ArtByAris"
                viewers="3.2K"
                imageClass="from-emerald-500/40 via-zinc-700 to-orange-500/20"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function RecommendedStream({
  title,
  streamer,
  viewers,
  imageClass,
}: {
  title: string;
  streamer: string;
  viewers: string;
  imageClass: string;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={`relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-gradient-to-br ${imageClass}`}
      >
        <div className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-white">
          {viewers}
        </div>
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-white/80">{title}</p>
        <p className="mt-0.5 truncate text-[11px] text-white/35">{streamer}</p>
      </div>
    </div>
  );
}
