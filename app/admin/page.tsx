// app/admin/page.tsx
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookCopy, Settings, Shield } from "lucide-react"; // Importar o ícone Shield

export default function AdminDashboard() {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Painel do Administrador</h1>
                <p className="text-muted-foreground">Gerencie os principais recursos da sua escola.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Card para Gerenciar Alunos */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle>Gerenciar Alunos</CardTitle>
                                <CardDescription>Adicione, edite e visualize os alunos.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin/students">
                            <Button className="w-full">Acessar Alunos</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Card para Gerenciar Professores */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 text-green-600 p-3 rounded-full">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle>Gerenciar Professores</CardTitle>
                                <CardDescription>Adicione, edite e gerencie os professores.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin/teachers">
                            <Button className="w-full">Acessar Professores</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Card para Gerenciar Turmas */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-100 text-purple-600 p-3 rounded-full">
                                <BookCopy className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle>Gerenciar Turmas</CardTitle>
                                <CardDescription>Crie e edite as turmas da escola.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin/classes">
                            <Button className="w-full">Acessar Turmas</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Card para Configurações - pode ser movido para uma nova linha se preferir */}
                <Card className="lg:col-span-3"> {/* Opcional: faz o card de config ocupar a largura toda em telas grandes */}
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-100 text-gray-600 p-3 rounded-full">
                                <Settings className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle>Configurações</CardTitle>
                                <CardDescription>Gerencie dados da escola e do admin.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin/settings">
                            <Button className="w-full">Acessar Configurações</Button>
                        </Link>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
