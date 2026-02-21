'use client'

// app/admin/page.tsx
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookCopy, Settings, Shield, LogOut } from "lucide-react";
import { logout } from "../auth/actions";

// Componente de Card Reutilizável para o Painel
function DashboardCard({ icon: Icon, title, description, href, buttonText, color }: any) {
    const colorClasses = {
        blue: {
            iconBg: 'bg-blue-500/10',
            iconText: 'text-blue-300',
            buttonGradient: 'from-blue-500 to-purple-500'
        },
        green: {
            iconBg: 'bg-green-500/10',
            iconText: 'text-green-300',
            buttonGradient: 'from-green-500 to-teal-500'
        },
        purple: {
            iconBg: 'bg-purple-500/10',
            iconText: 'text-purple-300',
            buttonGradient: 'from-purple-500 to-pink-500'
        },
        gray: {
            iconBg: 'bg-gray-500/10',
            iconText: 'text-gray-300',
            buttonGradient: 'from-gray-500 to-gray-700'
        },
    };

    const selectedColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.gray;

    return (
        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-8 flex flex-col items-center text-center">
                <div className={`w-20 h-20 flex items-center justify-center rounded-full mb-5 ${selectedColor.iconBg}`}>
                    <Icon className={`w-10 h-10 ${selectedColor.iconText}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-white/60 mb-6 flex-grow">{description}</p>
                <Link href={href} className="w-full mt-auto">
                    <Button className={`w-full font-bold py-6 rounded-full bg-gradient-to-r ${selectedColor.buttonGradient} hover:scale-105 transition-transform`}>
                        {buttonText}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 text-white">
             <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
            <div className="container mx-auto p-4 md:p-8 relative">
                {/* Cabeçalho */}
                <header className="mb-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold">Painel do Administrador</h1>
                        <p className="text-white/60">Bem-vindo de volta, gerencie tudo em um só lugar.</p>
                    </div>
                    <form action={logout}>
                        <Button variant="outline" type="submit" className="gap-2 bg-white/10 border-white/20 backdrop-blur-md text-white hover:bg-white/20 hover:text-white rounded-full px-6 py-5">
                            <LogOut size={18} />
                            Sair
                        </Button>
                    </form>
                </header>

                {/* Grid de Cards */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <DashboardCard 
                        icon={Users} 
                        title="Gerenciar Alunos" 
                        description="Adicione, edite e visualize os perfis e o progresso dos alunos." 
                        href="/admin/students" 
                        buttonText="Acessar Alunos"
                        color="blue"
                    />
                    <DashboardCard 
                        icon={Shield} 
                        title="Gerenciar Professores" 
                        description="Adicione ou remova professores e atribua-os a turmas específicas." 
                        href="/admin/teachers" 
                        buttonText="Acessar Professores"
                        color="green"
                    />
                    <DashboardCard 
                        icon={BookCopy} 
                        title="Gerenciar Turmas" 
                        description="Crie novas turmas, defina horários e organize a estrutura da escola."
                        href="/admin/classes" 
                        buttonText="Acessar Turmas"
                        color="purple"
                    />
                </div>
                 {/* Card de Configurações em destaque */}
                 <div className="mt-8">
                    <DashboardCard 
                            icon={Settings} 
                            title="Configurações Gerais" 
                            description="Ajuste as configurações globais da plataforma, gerencie dados da escola e sua conta de administrador."
                            href="/admin/settings" 
                            buttonText="Acessar Configurações"
                            color="gray"
                        />
                 </div>
            </div>
        </div>
    );
}
