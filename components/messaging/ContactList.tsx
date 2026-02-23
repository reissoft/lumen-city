'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Contact {
  id: string;
  name: string | null;
  role: 'teacher' | 'student';
}

interface CurrentUser {
  id: string;
}

interface ContactListProps {
  onSelectContact: (contact: Contact) => void;
  selectedContactId?: string;
  currentUser: CurrentUser;
  unreadMessages: Record<string, number>; 
}

export default function ContactList({ onSelectContact, selectedContactId, currentUser, unreadMessages }: ContactListProps) {
  const [contacts, setContacts] = useState<{ teachers: Contact[]; students: Contact[] }>({ teachers: [], students: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/users');
        setContacts({
          teachers: response.data.teachers || [],
          students: response.data.students || [],
        });
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setContacts({ teachers: [], students: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const renderContact = (contact: Contact) => {
    if (contact.id === currentUser.id) {
      return null;
    }

    const isSelected = contact.id === selectedContactId;
    const unreadCount = unreadMessages[contact.id];

    return (
      <div
        key={contact.id}
        onClick={() => onSelectContact(contact)}
        className={`relative flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${
          isSelected 
          ? 'bg-white/20' 
          : 'hover:bg-white/10'
        }`}
      >
        <div>
            <p className="font-semibold text-white">{contact.name}</p>
            <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-white/50'}`}>
            {contact.role === 'teacher' ? 'Professor' : 'Aluno'}
            </p>
        </div>
        {unreadCount > 0 && (
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                {unreadCount}
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-2 md:p-4 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 px-2 text-white">Contatos</h2>
      
      {isLoading ? (
        <p className="text-white/50 px-2">Carregando...</p>
      ) : (
        <div className="space-y-4">
          {/* CORREÇÃO: Só renderiza a seção de professores se houver professores */}
          {contacts.teachers.length > 0 && (
            <div>
              <h3 className="font-bold text-white/40 text-sm uppercase px-2 mb-2">Professores</h3>
              <div className="space-y-1">
                {contacts.teachers.map(renderContact)}
              </div>
            </div>
          )}

          {/* CORREÇÃO: Só renderiza a seção de alunos se houver alunos */}
          {contacts.students.length > 0 && (
            <div>
              <h3 className="font-bold text-white/40 text-sm uppercase px-2 mb-2">Alunos</h3>
              <div className="space-y-1">
                {contacts.students.map(renderContact)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
