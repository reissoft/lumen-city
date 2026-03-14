'use client';

import { useState } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Printer, MessageSquareText } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Tipagem esperada do banco de dados (QuestLog + Student + StudyCampaign)
export type QuestLogData = {
    id: string;
    student: { name: string };
    generatedQuest: string;
    studentAnswer: string;
    isCorrect: boolean;
    aiFeedback: string;
    createdAt: string;
};

export type CampaignReportData = {
    id: string;
    title: string;
    rewardCoins: number;
    logs: QuestLogData[];
};

// Função para converter YYYY-MM-DD para o objeto Date local
function parseDate(dateString: string) {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

const getYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

export default function CampaignReportClient({ campaign }: { campaign: CampaignReportData }) {
    const router = useRouter();

    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return getYYYYMMDD(date);
    });
    const [endDate, setEndDate] = useState(getYYYYMMDD(new Date()));
    const [studentFilter, setStudentFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'correct', 'incorrect'

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

    const filteredLogs = campaign.logs.filter(log => {
        // Filtro de Data
        const logDate = new Date(log.createdAt);
        const start = startOfDay(parseDate(startDate));
        const end = endOfDay(parseDate(endDate));
        const dateMatch = logDate >= start && logDate <= end;

        // Filtro de Aluno
        const studentMatch = studentFilter
            ? log.student.name.toLowerCase().includes(studentFilter.toLowerCase())
            : true;

        // Filtro de Acerto/Erro
        const statusMatch = 
            statusFilter === 'all' ? true :
            statusFilter === 'correct' ? Boolean(log.isCorrect) :
            !Boolean(log.isCorrect);

        return dateMatch && studentMatch && statusMatch;
    });

    const formattedStartDate = format(parseDate(startDate), "dd/MM/yyyy");
    const formattedEndDate = format(parseDate(endDate), "dd/MM/yyyy");

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-800 text-white" id="page-content">
             <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
            <div className="container mx-auto p-4 md:p-8 relative">

                <button onClick={() => router.back()} id="back-button" className="no-print inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 rounded-full px-4 py-2 text-sm mb-8 transition-colors">
                    <ArrowLeft size={16} /> Voltar para Campanhas
                </button>

                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <MessageSquareText className="text-indigo-400 w-8 h-8" />
                        <h1 className="text-3xl md:text-4xl font-bold">{campaign.title}</h1>
                    </div>
                    <p className="text-white/60 mt-2">
                        Relatório de interações da Inteligência Artificial com os alunos. <br className="sm:hidden" />
                        <span className="font-semibold text-indigo-300">Recompensa da Campanha: {campaign.rewardCoins} Moedas</span>
                    </p>
                    <p className="text-white/60 mt-1">
                        <span className="font-semibold">Período exibido: {formattedStartDate} a {formattedEndDate}</span>
                    </p>
                </header>

                <div id="filter-section" className="mb-6 flex flex-wrap justify-end gap-4 no-print">
                    <div className='grid w-full sm:w-auto items-center gap-1.5'>
                        <Label htmlFor='student_filter' className='text-white/80'>Buscar Aluno</Label>
                        <Input 
                            id='student_filter'
                            type='text' 
                            placeholder='Nome do aluno...'
                            value={studentFilter}
                            onChange={(e) => setStudentFilter(e.target.value)}
                            className='bg-white/10 border-white/20 backdrop-blur-md text-white placeholder:text-white/50'
                        />
                    </div>
                    <div className='grid w-full sm:w-auto items-center gap-1.5'>
                        <Label className='text-white/80'>Status de Correção</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="bg-white/10 border-white/20 backdrop-blur-md text-white w-full sm:w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-950/80 backdrop-blur-lg border-white/20 text-white">
                                <SelectItem value="all">Todos os Status</SelectItem>
                                <SelectItem value="correct">Acertos</SelectItem>
                                <SelectItem value="incorrect">Erros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='grid w-full sm:w-auto items-center gap-1.5'>
                        <Label htmlFor='start_date' className='text-white/80'>Data Inicial</Label>
                        <Input 
                            id='start_date'
                            type='date' 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className='bg-white/10 border-white/20 backdrop-blur-md text-white file:text-white'
                        />
                    </div>
                    <div className='grid w-full sm:w-auto items-center gap-1.5'>
                        <Label htmlFor='end_date' className='text-white/80'>Data Final</Label>
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
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-white/10 hover:bg-transparent">
                                    <TableHead className="text-white/80 min-w-[150px]">Aluno / Data</TableHead>
                                    <TableHead className="text-white/80 min-w-[200px]">Pergunta da IA</TableHead>
                                    <TableHead className="text-white/80 min-w-[200px]">Resposta do Aluno</TableHead>
                                    <TableHead className="text-white/80 w-[100px]">Status</TableHead>
                                    <TableHead className="text-white/80 min-w-[250px]">Feedback da IA</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map(log => (
                                        <TableRow key={log.id} className="border-b-white/10 hover:bg-white/5">
                                            
                                            <TableCell className="align-top">
                                                <div className="font-bold text-white mb-1">{log.student.name}</div>
                                                <div className="text-xs text-white/50">
                                                    {format(new Date(log.createdAt), "dd/MM/yy 'às' HH:mm")}
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="align-top">
                                                <p className="text-sm text-slate-300 italic line-clamp-4 hover:line-clamp-none transition-all">
                                                    "{log.generatedQuest}"
                                                </p>
                                            </TableCell>
                                            
                                            <TableCell className="align-top">
                                                <div className="bg-slate-950/30 p-2 rounded-md border border-slate-700/50 text-sm text-slate-200">
                                                    {log.studentAnswer}
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="align-top text-center">
                                                {log.isCorrect ? 
                                                    <div className="flex flex-col items-center gap-1">
                                                        <CheckCircle size={24} className="text-emerald-400" />
                                                        <span className="text-[10px] font-bold text-emerald-400 uppercase">Acertou</span>
                                                    </div> : 
                                                    <div className="flex flex-col items-center gap-1">
                                                        <XCircle size={24} className="text-red-400" />
                                                        <span className="text-[10px] font-bold text-red-400 uppercase">Errou</span>
                                                    </div>
                                                }
                                            </TableCell>
                                            
                                            <TableCell className="align-top">
                                                <p className="text-sm text-indigo-200 bg-indigo-500/10 p-2 rounded-md border border-indigo-500/20">
                                                    {log.aiFeedback}
                                                </p>
                                            </TableCell>

                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-48 text-white/50">
                                            Nenhuma resposta encontrada para esta campanha com os filtros atuais.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </main>
            </div>
        </div>
    );
}