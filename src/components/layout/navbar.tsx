'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { searchAPI, SearchStreamerResult } from '@/lib/api/search';
import { Search, Bell, User, LogOut, Settings, Gem, ChevronDown, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/lib/store/store';
import { logout } from '@/lib/features/auth/authSlice';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { useGiftBalance } from '@/lib/hooks/use-gifts';


export function Navbar() {
  const router = useRouter();
  const { user, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const { data: balanceData } = useGiftBalance();
  const balance = balanceData?.balance ?? 0;
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchStreamerResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dispatch = useDispatch<AppDispatch>();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const results = await searchAPI.getSuggestions(query.trim());
        setSuggestions(results);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Click outside để đóng suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[selectedIndex];
      router.push(`/profile/${selected.username}`);
      setShowSuggestions(false);
      setQuery('');
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (username: string) => {
    router.push(`/profile/${username}`);
    setShowSuggestions(false);
    setQuery('');
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();

      router.replace('/');
      router.refresh();
    } catch (error) {
      console.error('Đăng xuất thất bại:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-md border-b border-white/10 h-16">
      <div className="max-w-screen-2xl mx-auto px-4 h-full flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white hidden sm:block">NeonStream</span>
        </Link>

        {/* Search Bar */}
        <div ref={searchRef} className="flex-1 max-w-xl relative">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Tìm streamer hoặc tiêu đề stream..."
                className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
              />
            </div>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full mt-2 w-full bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
              {loadingSuggestions ? (
                <div className="p-4 text-center text-gray-400 text-sm">Đang tìm...</div>
              ) : suggestions.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">Không tìm thấy kết quả</div>
              ) : (
                <>
                  <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider border-b border-white/5">
                    Streamers
                  </div>
                  {suggestions.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => handleSuggestionClick(s.username)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left ${idx === selectedIndex ? 'bg-white/10' : ''
                        }`}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={s.avatar ?? undefined} />
                          <AvatarFallback className="bg-purple-600 text-xs">
                            {s.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {s.isLive && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1a1a2e]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white font-medium truncate">{s.username}</div>
                        {s.fullName && (
                          <div className="text-xs text-gray-400 truncate">{s.fullName}</div>
                        )}
                      </div>
                      {s.isLive && (
                        <span className="shrink-0 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium">
                          LIVE
                        </span>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-purple-400 hover:bg-white/5 border-t border-white/5 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    Xem tất cả kết quả cho &quot;{query}&quot;
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {user ? (
            <>
            <Button
          size="sm"
          className="rounded-xl bg-violet-500 px-5 font-bold text-white hover:bg-violet-400"
          asChild
        >
          <Link href="/stream/stream-guide">Phát trực tiếp</Link>
        </Button>
              <Link href="/store/diamonds">
                <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300 gap-1.5">
                  <Gem className="w-4 h-4" />
                  <span className="hidden sm:inline">{balance ?? 0}</span>
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:bg-white/5 rounded-lg px-2 py-1.5 transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar ?? undefined} />
                      <AvatarFallback className="bg-purple-600 text-xs">
                        {user.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-white hidden sm:block">{user.username}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10 text-white w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.username}`} className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" /> Trang cá nhân
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="w-4 h-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onSelect={() => void handleLogout()}
                    disabled={isLoading}
                    className="text-red-400 focus:text-red-300 cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {isLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-300">Đăng nhập</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Đăng ký</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
