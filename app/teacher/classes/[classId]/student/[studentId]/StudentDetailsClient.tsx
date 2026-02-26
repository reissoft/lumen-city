'use client';

import { useState } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Printer } from "lucide-react";
import { StudentPageData } from './page';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Função para converter YYYY-MM-DD para o objeto Date local
function parseDate(dateString: string) {
    if (!dateString) return new Date(); // Retorna data atual se string for vazia
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

// Função para obter a data no formato YYYY-MM-DD
const getYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

export default function StudentDetailsClient({ data, classId }: { data: StudentPageData, classId: string }) {
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return getYYYYMMDD(date);
    });
    const [endDate, setEndDate] = useState(getYYYYMMDD(new Date()));
    const [activityFilter, setActivityFilter] = useState('');
    const [completionFilter, setCompletionFilter] = useState('all'); // 'all', 'completed', 'not-completed'

    const handlePrint = () => {
        const printStylesheet = document.createElement('link');
        printStylesheet.rel = 'stylesheet';
        printStylesheet.href = '/print.css';
        printStylesheet.id = 'print-stylesheet';
        document.head.appendChild(printStylesheet);

        setTimeout(() => {
            window.print();
        }, 250);
    };

    if (typeof window !== 'undefined') {
        window.onafterprint = () => {
            const printSheet = document.getElementById('print-stylesheet');
            if (printSheet) {
                document.head.removeChild(printSheet);
            }
        };
    }

    const filteredAttempts = data.activityAttempts.filter(attempt => {
        // Filtro de Data
        const attemptDate = new Date(attempt.createdAt);
        const start = startOfDay(parseDate(startDate));
        const end = endOfDay(parseDate(endDate));
        const dateMatch = attemptDate >= start && attemptDate <= end;

        // Filtro de Atividade
        const activityMatch = activityFilter
            ? attempt.activity.title.toLowerCase().includes(activityFilter.toLowerCase())
            : true;

        // Filtro de Conclusão (CORRIGIDO)
        const completionMatch = 
            completionFilter === 'all' ? true :
            completionFilter === 'completed' ? Boolean(attempt.completed) :
            !Boolean(attempt.completed);

        return dateMatch && activityMatch && completionMatch;
    });

    const formattedStartDate = format(parseDate(startDate), "dd/MM/yyyy");
    const formattedEndDate = format(parseDate(endDate), "dd/MM/yyyy");

    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-800 text-white" id="page-content">
             <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
            <div className="container mx-auto p-4 md:p-8 relative">

                <button onClick={() => router.back()} id="back-button" className="no-print inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 rounded-full px-4 py-2 text-sm mb-8 transition-colors">
                    <ArrowLeft size={16} /> Voltar para a Turma
                </button>

                <header className="mb-10">
                    <h1 className="text-4xl font-bold">{data.student.name}</h1>
                    <p className="text-white/60 mt-2">
                        Resumo de atividades realizadas. <br className="sm:hidden" />
                        <span className="font-semibold">Período de {formattedStartDate} a {formattedEndDate}</span>
                    </p>
                </header>

                <div id="filter-section" className="mb-6 flex flex-wrap justify-end gap-4 no-print">
                    <div className='grid w-full sm:w-auto items-center gap-1.5'>
                        <Label htmlFor='activity_filter' className='text-white/80'>Filtrar por Atividade</Label>
                        <Input 
                            id='activity_filter'
                            type='text' 
                            placeholder='Nome da atividade...'
                            value={activityFilter}
                            onChange={(e) => setActivityFilter(e.target.value)}
                            className='bg-white/10 border-white/20 backdrop-blur-md text-white placeholder:text-white/50'
                        />
                    </div>
                    <div className='grid w-full sm:w-auto items-center gap-1.5'>
                        <Label className='text-white/80'>Status</Label>
                        <Select value={completionFilter} onValueChange={setCompletionFilter}>
                            <SelectTrigger className="bg-white/10 border-white/20 backdrop-blur-md text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-950/80 backdrop-blur-lg border-white/20 text-white">
                                <SelectItem value="all">Status (Todos)</SelectItem>
                                <SelectItem value="completed">Concluída</SelectItem>
                                <SelectItem value="not-completed">Não Concluída</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='grid w-full sm:w-auto items-center gap-1.5'>
                        <Label htmlFor='start_date' className='text-white/80'>Data de Início</Label>
                        <Input 
                            id='start_date'
                            type='date' 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className='bg-white/10 border-white/20 backdrop-blur-md text-white file:text-white'
                        />
                    </div>
                    <div className='grid w-full sm:w-auto items-center gap-1.5'>
                        <Label htmlFor='end_date' className='text-white/80'>Data de Fim</Label>
                        <Input 
                            id='end_date'
                            type='date' 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className='bg-white/10 border-white/20 backdrop-blur-md text-white'
                        />
                    </div>
                    <div className="grid items-end">
                        <Button onClick={handlePrint} variant='outline' className='bg-white/10 border-white/20 backdrop-blur-md text-white hover:bg-white/20 hover:text-white'>
                            <Printer size={16} className="mr-2" />
                            Imprimir
                        </Button>
                    </div>
                </div>

                <main className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-white/10 hover:bg-transparent">
                                <TableHead className="text-white/80">Atividade</TableHead>
                                <TableHead className="text-white/80">Tipo</TableHead>
                                <TableHead className="text-white/80">Data</TableHead>
                                <TableHead className="text-white/80">Completou</TableHead>
                                <TableHead className="text-right text-white/80">Pontuação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAttempts.length > 0 ? (
                                filteredAttempts.map(attempt => (
                                    <TableRow key={attempt.id} className="border-b-white/10 hover:bg-white/5">
                                        <TableCell className="font-medium text-white">{attempt.activity.title}</TableCell>
                                        <TableCell className="text-white/70">{attempt.activity.type}</TableCell>
                                        <TableCell className="text-white/70">{format(new Date(attempt.createdAt), "dd/MM/yyyy")}</TableCell>
                                        <TableCell>
                                            {attempt.completed ? 
                                                <CheckCircle size={18} className="text-green-400" /> : 
                                                <XCircle size={18} className="text-red-400" />
                                            }
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge className={`font-bold ${attempt.score && attempt.score > 70 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                                {attempt.score !== null ? `${attempt.score}%` : 'N/A'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-48 text-white/50">
                                        Nenhuma atividade encontrada com os filtros atuais.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </main>
            </div>
        </div>
    );
}
