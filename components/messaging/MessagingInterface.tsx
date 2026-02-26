'use client';

import { useState, useEffect } from 'react';
import ContactList from './ContactList';
import MessageWindow from './MessageWindow';

interface CurrentUser {
  id: string;
  name: string | null;
  role: string;
  schoolId: string | null;
}

interface Contact {
  id: string;
  name: string;
  role: 'teacher' | 'student';
}

interface MessagingInterfaceProps {
  currentUser: CurrentUser;
  initialUnreadMessages: Record<string, number>;
  isModerating?: boolean; // MODIFICAÇÃO: Adiciona a prop opcional
  initialSystem?: boolean; // abrir conversa com sistema automaticamente
}

export default function MessagingInterface({ currentUser, initialUnreadMessages, isModerating = false, initialSystem = false }: MessagingInterfaceProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(initialUnreadMessages);

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    if (unreadMessages[contact.id]) {
      setUnreadMessages(prev => {
        const newUnread = { ...prev };
        delete newUnread[contact.id];
        return newUnread;
      });
    }
  };

  // handle initial system open
  useEffect(() => {
    if (initialSystem) {
      setSelectedContact({ id: 'system', name: 'Sistema', role: 'teacher' });
    }
  }, [initialSystem]);

  return (
    <div className="flex h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg overflow-hidden">
      
      <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-white/10 ${selectedContact ? 'hidden md:flex' : 'flex'} flex-col`}>
        <ContactList 
          currentUser={currentUser}
          // @ts-ignore 
          onSelectContact={handleSelectContact} 
          selectedContactId={selectedContact?.id}
          unreadMessages={unreadMessages}
          isModerating={isModerating} // MODIFICAÇÃO: Passa a prop para o ContactList
        />
      </div>

      <div className={`w-full md:w-2/3 lg:w-3/4 ${selectedContact ? 'flex' : 'hidden md:flex'} flex-col`}>
        {selectedContact ? (
          <MessageWindow 
            contact={selectedContact} 
            currentUser={currentUser} 
            onBack={() => setSelectedContact(null)} 
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/50">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Bem-vindo ao Mensagens</h2>
                <p className="mt-2 text-white/40">Selecione um contato para iniciar uma conversa.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
