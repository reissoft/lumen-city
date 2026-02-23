'use client';

import { useState } from 'react';
import ContactList from './ContactList';
import MessageWindow from './MessageWindow';

// Tipo para o usuário logado, recebido como prop
interface CurrentUser {
  id: string;
  name: string | null;
  role: string;
  schoolId: string | null;
}

// Tipo para o contato selecionado na lista
interface Contact {
  id: string;
  name: string;
  role: 'teacher' | 'student';
}

interface MessagingInterfaceProps {
  currentUser: CurrentUser;
}

export default function MessagingInterface({ currentUser }: MessagingInterfaceProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // O usuário agora é recebido via props, então não há mais necessidade de buscá-lo aqui.

  return (
    <div className="flex h-full bg-white text-black">
      <div className="w-1/4">
        <ContactList onSelectContact={setSelectedContact} />
      </div>
      <div className="w-3/4 flex flex-col">
        {selectedContact ? (
          // Passamos o currentUser para o MessageWindow, que também precisará dele.
          <MessageWindow contact={selectedContact} currentUser={currentUser} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Selecione um contato para iniciar a conversa</p>
          </div>
        )}
      </div>
    </div>
  );
}
