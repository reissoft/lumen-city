"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface Friend {
  id: string;
  name: string;
}

export default function FriendCityModal({ classmates }: { classmates: Friend[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-bold bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-colors">
          Ver cidade de amigo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecionar amigo</DialogTitle>
          <DialogDescription>Visualize a cidade de um colega sem poder editar.</DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-60 overflow-y-auto">
          {classmates.length > 0 ? (
            classmates.map((cls) => (
              <Link key={cls.id} href={`/student/city/${cls.id}`} className="block py-2 px-4 rounded hover:bg-gray-100 text-gray-900">
                {cls.name}
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-500">Nenhum colega encontrado.</p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
