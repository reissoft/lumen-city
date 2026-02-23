'use client';

import { useState } from 'react';
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
}

export default function MessagingInterface({ currentUser }: MessagingInterfaceProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  return (
    // 1. Aplicando o estilo de vidro (glassmorphism)
    <div className="flex h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg overflow-hidden">
      
      {/* -- Lista de Contatos -- */}
      <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-white/10 ${selectedContact ? 'hidden md:flex' : 'flex'} flex-col`}>
        <ContactList 
          currentUser={currentUser}
          onSelectContact={setSelectedContact} 
          selectedContactId={selectedContact?.id}
        />
      </div>

      {/* -- Janela de Mensagem -- */}
      <div className={`w-full md:w-2/3 lg:w-3/4 ${selectedContact ? 'flex' : 'hidden md:flex'} flex-col`}>
        {selectedContact ? (
          <MessageWindow 
            contact={selectedContact} 
            currentUser={currentUser} 
            onBack={() => setSelectedContact(null)} 
          />
        ) : (
          // 2. Mensagem para telas grandes, com estilo adaptado ao novo fundo
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
