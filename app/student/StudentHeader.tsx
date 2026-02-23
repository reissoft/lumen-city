'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import { logout } from "../auth/actions";
import NotificationBell from '@/components/notifications/NotificationBell';

export default function StudentHeader({ studentName }: { studentName: string }) {
  return (
    <header className="flex flex-wrap justify-between items-center gap-4">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold">Portal do Aluno</h1>
            <p className="text-white/60">Bem-vindo(a) de volta, {studentName}!</p>
        </div>
        <div className="flex items-center gap-4">
            <NotificationBell />
            <Link href="/student/settings">
                <Button variant="outline" size="icon" className="font-semibold rounded-full bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-colors flex items-center gap-2">
                    <Settings size={16} />
                </Button>
            </Link>
            <form action={logout}>
                 <Button variant="outline" size="icon" className="font-semibold rounded-full bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-colors flex items-center gap-2">
                    <LogOut size={16} />
                </Button>
            </form>
        </div>
    </header>
  );
}
