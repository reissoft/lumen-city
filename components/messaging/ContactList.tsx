'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Contact {
  id: string;
  name: string | null;
  role: 'teacher' | 'student';
}

interface ContactListProps {
  onSelectContact: (contact: Contact) => void;
}

export default function ContactList({ onSelectContact }: ContactListProps) {
  // Estado corrigido: inicializado com arrays vazios para evitar o erro 'map' of null
  const [contacts, setContacts] = useState<{ teachers: Contact[]; students: Contact[] }>({ teachers: [], students: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/users');
        // Garantir que, mesmo que a API retorne null/undefined, o estado seja um array
        setContacts({
          teachers: response.data.teachers || [],
          students: response.data.students || [],
        });
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setContacts({ teachers: [], students: [] }); // Limpa em caso de erro
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  return (
    <div className="p-4 border-r border-gray-200 h-full overflow-y-auto text-black">
      <h2 className="text-xl font-bold mb-4">Contatos</h2>
      
      {isLoading ? (
        <p className="text-gray-500">Carregando contatos...</p>
      ) : (
        <>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Professores</h3>
            <div className="space-y-2">
              {contacts.teachers.length > 0 ? (
                contacts.teachers.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => onSelectContact(contact)}
                    className="p-2 rounded-lg cursor-pointer hover:bg-gray-200"
                  >
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-sm text-gray-500">Professor</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">Nenhum professor encontrado.</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-2">Alunos</h3>
            <div className="space-y-2">
              {contacts.students.length > 0 ? (
                contacts.students.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => onSelectContact(contact)}
                    className="p-2 rounded-lg cursor-pointer hover:bg-gray-200"
                  >
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-sm text-gray-500">Aluno</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">Nenhum aluno encontrado.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
