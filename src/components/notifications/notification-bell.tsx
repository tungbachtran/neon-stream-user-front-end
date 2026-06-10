'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/hooks/use-auth';
import { API_BASE_URL } from '@/lib/api/config';
import { useSelector } from 'react-redux';


interface FollowNotification {
  type: 'new_follower';
  follower: {
    id: string;
    username: string;
    avatar: string | null;
  };
  timestamp: string;
}

export function NotificationBell() {
  const { user } = useSelector(state => state.auth);
  const [notifications, setNotifications] = useState<FollowNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    // SSE connection để nhận follow notifications
    const eventSource = new EventSource(
      `${API_BASE_URL}/follows/notifications/stream`,
      // Note: EventSource không hỗ trợ custom headers natively
      // Nếu backend dùng cookie auth thì sẽ tự động gửi
    );

    eventSource.onmessage = (e) => {
      try {
        const data: FollowNotification = JSON.parse(e.data);
        setNotifications((prev) => [data, ...prev].slice(0, 20));
        setUnreadCount((prev) => prev + 1);
      } catch {}
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [user]);

  // Click outside để đóng
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) setUnreadCount(0);
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-300 hover:text-white"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="font-semibold text-white text-sm">Thông báo</span>
            {notifications.length > 0 && (
              <button
                onClick={() => setNotifications([])}
                className="text-xs text-gray-400 hover:text-white"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                Chưa có thông báo nào
              </div>
            ) : (
              notifications.map((n, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0"
                >
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarImage src={n.follower.avatar ?? undefined} />
                    <AvatarFallback className="bg-purple-600 text-xs">
                      {n.follower.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-semibold">{n.follower.username}</span>
                      {' '}đã follow bạn
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(n.timestamp).toLocaleTimeString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
