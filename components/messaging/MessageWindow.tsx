'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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
}

export default function MessageWindow({ contact, currentUser }: MessageWindowProps) {
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

      const { newMessage: sentMessage, senderDetails } = response.data;

      // Correção: Construir o objeto completo para a UI, incluindo os IDs do remetente
      const newCompleteMessage: Message = {
        ...sentMessage,
        senderTeacher: senderDetails.role !== 'student' ? { id: senderDetails.id, name: senderDetails.name } : null,
        senderStudent: senderDetails.role === 'student' ? { id: senderDetails.id, name: senderDetails.name } : null,
        senderTeacherId: senderDetails.role !== 'student' ? senderDetails.id : null,
        senderStudentId: senderDetails.role === 'student' ? senderDetails.id : null,
      };

      setMessages(prevMessages => [...prevMessages, newCompleteMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 text-black">
      <header className="bg-gray-200 p-4 border-b border-gray-300">
        <h2 className="font-bold text-lg">{contact.name}</h2>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => {
          // Correção: Lógica de verificação do usuário atual mais robusta
          const isCurrentUser = (message.senderTeacherId === currentUser.id) || (message.senderStudentId === currentUser.id);
          const sender = message.senderTeacher || message.senderStudent;
          const senderName = sender?.name || 'Usuário desconhecido';

          return (
            <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`rounded-lg px-4 py-2 max-w-sm ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-white'}`}>
                {/* Correção: O nome do remetente só aparece se NÃO for o usuário atual */}
                {!isCurrentUser && (
                  <p className="text-xs text-gray-600 font-bold">{senderName}</p>
                )}
                <p>{message.content}</p>
                {/* Correção: Formatação de hora mais limpa */}
                <p className="text-xs text-right mt-1 opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-gray-200 p-4 border-t border-gray-300">
        <div className="flex">
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
            className="ml-4 bg-blue-500 text-white rounded-full px-4 py-2 font-bold hover:bg-blue-600 focus:outline-none"
          >
            Enviar
          </button>
        </div>
      </footer>
    </div>
  );
}
