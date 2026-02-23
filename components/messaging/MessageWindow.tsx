'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderTeacher: { id: string; name: string | null } | null;
  senderStudent: { id: string; name: string | null } | null;
  senderTeacherId: string | null;
  senderStudentId: string | null;
}

interface Contact {
  id: string;
  name: string;
}

interface CurrentUser {
  id: string;
  name: string | null;
  role: string;
}

interface MessageWindowProps {
  contact: Contact;
  currentUser: CurrentUser;
  onBack: () => void;
}

export default function MessageWindow({ contact, currentUser, onBack }: MessageWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!contact) return;
      try {
        const response = await axios.get(`/api/messages?contactId=${contact.id}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [contact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    try {
      const response = await axios.post('/api/messages', {
        recipientId: contact.id,
        content: newMessage,
      });

      const sentMessage = response.data;

      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-black">
      <header className="flex items-center gap-4 bg-gray-50 p-3 border-b border-gray-200">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-bold text-lg">{contact.name}</h2>
      </header>

      <main className="flex-1 p-4 overflow-y-auto bg-gray-100">
        {messages.map((message) => {
          const isCurrentUser = (message.senderTeacherId === currentUser.id) || (message.senderStudentId === currentUser.id);
          const sender = message.senderTeacher || message.senderStudent;
          const senderName = sender?.name || 'Usuário desconhecido';

          return (
            <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
              {/* CORREÇÃO: Removido o ternário inválido */}
              <div className={`rounded-lg px-4 py-2 max-w-sm shadow ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-white'}`}>
                {!isCurrentUser && (
                  <p className="text-xs text-gray-600 font-bold">{senderName}</p>
                )}
                <p>{message.content}</p>
                <p className="text-xs text-right mt-1 opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Digite sua mensagem..."
            className="flex-1 rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white rounded-full px-5 py-2 font-bold hover:bg-blue-600 focus:outline-none"
          >
            Enviar
          </button>
        </div>
      </footer>
    </div>
  );
}
