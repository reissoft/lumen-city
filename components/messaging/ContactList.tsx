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

// 1. Adicionar `selectedContactId` e `currentUser` às props
interface ContactListProps {
  onSelectContact: (contact: Contact) => void;
  selectedContactId?: string;
  currentUser: CurrentUser;
}

export default function ContactList({ onSelectContact, selectedContactId, currentUser }: ContactListProps) {
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

  // Função para renderizar um item de contato, agora com lógica de destaque
  const renderContact = (contact: Contact) => {
    // Não mostrar o próprio usuário na lista de contatos
    if (contact.id === currentUser.id) {
      return null;
    }

    const isSelected = contact.id === selectedContactId;

    return (
      <div
        key={contact.id}
        onClick={() => onSelectContact(contact)}
        // 2. Aplicar estilo condicional se o contato estiver selecionado
        className={`p-3 rounded-lg cursor-pointer transition-colors ${
          isSelected 
          ? 'bg-blue-500/10 text-blue-800' 
          : 'hover:bg-gray-100'
        }`}
      >
        <p className="font-semibold">{contact.name}</p>
        <p className={`text-sm ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
          {contact.role === 'teacher' ? 'Professor' : 'Aluno'}
        </p>
      </div>
    );
  };

  return (
    <div className="p-2 md:p-4 h-full overflow-y-auto text-black bg-white">
      <h2 className="text-2xl font-bold mb-4 px-2">Contatos</h2>
      
      {isLoading ? (
        <p className="text-gray-500 px-2">Carregando...</p>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-gray-500 text-sm uppercase px-2 mb-2">Professores</h3>
            <div className="space-y-1">
              {contacts.teachers.length > 0 ? (
                contacts.teachers.map(renderContact)
              ) : (
                <p className="text-sm text-gray-400 px-2">Nenhum professor.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-500 text-sm uppercase px-2 mb-2">Alunos</h3>
            <div className="space-y-1">
              {contacts.students.length > 0 ? (
                contacts.students.map(renderContact)
              ) : (
                <p className="text-sm text-gray-400 px-2">Nenhum aluno.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
