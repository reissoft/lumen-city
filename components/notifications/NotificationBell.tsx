'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  message: {
    content: string;
    senderTeacher: { id: string; name: string | null } | null;
    senderStudent: { id: string; name: string | null } | null;
  };
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.slice(0, 5)); 
      setUnreadCount(response.data.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleBellClick = async () => {
    const isOpening = !isOpen;
    setIsOpen(isOpening);

    if (isOpening && unreadCount > 0) {
      try {
        await axios.delete('/api/notifications');
        setUnreadCount(0);
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    }
  };

  const handleNotificationClick = (contactId: string) => {
    setIsOpen(false);
    router.push(`/messaging?contactId=${contactId}`);
  };

  const handleGoToMessages = () => {
    setIsOpen(false);
    router.push('/messaging');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Correção: Usar o componente Button para consistência visual */}
      <Button 
        onClick={handleBellClick} 
        variant="outline"
        size="icon"
        className="relative bg-white/10 border-white/20 rounded-full backdrop-blur-md hover:bg-white/20"
      >
        <Bell className="h-5 w-5 text-white/80" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-20 text-black">
          <div className="py-2 px-4 text-sm font-bold text-gray-700 border-b">Notificações</div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => {
                const sender = notification.message.senderTeacher || notification.message.senderStudent;
                const senderName = sender?.name || 'Sistema';
                const senderId = sender?.id;

                // show even if senderId is missing (system)
                return (
                  <div 
                    key={notification.id} 
                    onClick={() => {
                      if (senderId) {
                        handleNotificationClick(senderId);
                      } else {
                        // go to system conversation
                        setIsOpen(false);
                        router.push('/messaging?system=true');
                      }
                    }}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                  >
                    <p className="text-sm text-gray-600">
                      Nova mensagem de <span className="font-bold">{senderName}</span>
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {notification.message.content}
                    </p>
                  </div>
                );
              })
            ) : (
                <div className="px-4 py-8 text-sm text-gray-500 text-center">
                    Nenhuma nova notificação
                </div>
            )}
          </div>
          <div className="border-t border-gray-200">
            <button 
              onClick={handleGoToMessages} 
              className="w-full text-center px-4 py-3 text-sm font-medium text-blue-600 hover:bg-gray-100 transition-colors"
            >
              Ir para Mensagens
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
