'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ArrowLeft, Send } from 'lucide-react';
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
  // 1. Adicionando estado de carregamento
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!contact) return;
      
      setIsLoading(true); // Inicia o carregamento
      setMessages([]);

      try {
        const response = await axios.get(`/api/messages?contactId=${contact.id}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false); // Finaliza o carregamento
      }
    };

    fetchMessages();
  }, [contact]);

  useEffect(() => {
    // Garante o scroll para o final apenas quando as mensagens forem carregadas
    if (!isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

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
    <div className="flex flex-col h-full text-white">
      <header className="flex items-center gap-4 bg-black/10 p-3 border-b border-white/10">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="md:hidden text-white/80 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-bold text-lg text-white">{contact.name}</h2>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        {/* 2. Lógica de exibição com 3 estados: Carregando, Sem Mensagens, Com Mensagens */}
        {isLoading ? (
          <div className="flex justify-center items-center h-full text-white/50">Carregando mensagens...</div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-white/50">
            <p className="text-center">Sem mensagens por aqui.<br/>Que tal iniciar a conversa?</p>
          </div>
        ) : (
            messages.map((message) => {
            const isCurrentUser = (message.senderTeacherId === currentUser.id) || (message.senderStudentId === currentUser.id);
            const sender = message.senderTeacher || message.senderStudent;
            const senderName = sender?.name || 'Usuário desconhecido';

            return (
                <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`rounded-2xl px-4 py-2 max-w-md shadow-md ${isCurrentUser ? 'bg-blue-600/80 text-white' : 'bg-black/20 backdrop-blur-sm'}`}>
                    {!isCurrentUser && (
                    <p className="text-xs text-white/70 font-bold">{senderName}</p>
                    )}
                    <p className="text-white">{message.content}</p>
                    <p className="text-xs text-right mt-1 opacity-60">
                    {new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                </div>
            );
            })
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-black/10 p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-white/5 border-2 border-white/20 rounded-full px-5 py-3 text-base placeholder:text-white/50 focus:ring-0 focus:border-blue-400 transition-colors"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-14 h-14 flex-shrink-0 text-base font-bold hover:scale-105 transition-transform"
            size="icon"
            disabled={!newMessage.trim()}
          >
            <Send className="w-6 h-6" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
