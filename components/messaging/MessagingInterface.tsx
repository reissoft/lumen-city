'use client';

import { useState } from 'react';
import ContactList from './ContactList';
import MessageWindow from './MessageWindow';
import { useSearchParams } from 'next/navigation';

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
}

export default function MessagingInterface({ currentUser }: MessagingInterfaceProps) {
  // O estado `selectedContact` agora controla qual view mostrar no mobile.
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  return (
    <div className="flex h-full bg-white/90 backdrop-blur-lg text-black rounded-xl overflow-hidden">
      
      {/* -- Lista de Contatos -- */}
      {/* Visível por padrão. Em telas `md` ou maiores, fica sempre visível. */}
      {/* Em telas menores, é OCULTADO se um contato for selecionado. */}
      <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200/80 ${selectedContact ? 'hidden md:flex' : 'flex'} flex-col`}>
        <ContactList 
          currentUser={currentUser}
          onSelectContact={setSelectedContact} 
          selectedContactId={selectedContact?.id}
        />
      </div>

      {/* -- Janela de Mensagem -- */}
      {/* Oculta por padrão em telas pequenas. */}
      {/* Aparece quando um contato é selecionado. */}
      <div className={`w-full md:w-2/3 lg:w-3/4 ${selectedContact ? 'flex' : 'hidden md:flex'} flex-col`}>
        {selectedContact ? (
          <MessageWindow 
            contact={selectedContact} 
            currentUser={currentUser} 
            // Passa uma função para o botão "Voltar" no mobile
            onBack={() => setSelectedContact(null)} 
          />
        ) : (
          // Mensagem para telas grandes quando nenhum contato está selecionado
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Selecione um contato para iniciar a conversa</p>
          </div>
        )}
      </div>
    </div>
  );
}
