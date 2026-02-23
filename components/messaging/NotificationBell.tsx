'use client';

import { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline'; // Using Heroicons for the bell icon

interface Notification {
  id: string;
  message: {
    id: string;
    content: string;
    senderTeacher?: { name: string };
    senderStudent?: { name: string };
  };
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const markAsRead = async () => {
    if (notifications.length === 0) return;

    const notificationIds = notifications.map(n => n.id);

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });
      setNotifications([]); // Clear notifications from the UI
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative">
        <BellIcon className="h-6 w-6 text-gray-600" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs text-center">
            {notifications.length}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-10">
          <div className="p-4 flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            {notifications.length > 0 && (
                 <button onClick={markAsRead} className="text-sm text-blue-500 hover:underline">Mark all as read</button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              <ul>
                {notifications.map((notif) => (
                  <li key={notif.id} className="p-2 border-t">
                    <p className="text-sm text-gray-700">
                      New message from <span className="font-semibold">{notif.message.senderTeacher?.name || notif.message.senderStudent?.name}</span>: "{notif.message.content.substring(0, 30)}..."
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-sm text-gray-500">No new notifications.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
