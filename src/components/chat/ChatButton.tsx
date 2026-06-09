'use client';
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatWindow } from './ChatWindow';
import { useAppSelector } from '@/types/redux-type';


export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  if (!user) return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-violet-600 hover:bg-violet-700 shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>

      {isOpen && (
        <ChatWindow
          userId={user.id}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
