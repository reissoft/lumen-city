'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, startOfDay, endOfDay } from 'date-fns';
import { ArrowLeft, Search, CheckCircle, XCircle, Printer } from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivityStatsData } from './page';

export default function ActivityStatsClient({ data }: { data: ActivityStatsData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [completionFilter, setCompletionFilter] = useState('all');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  function parseDate(dateString: string) {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

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

  const filteredAttempts = data.attempts.filter(attempt => {
    const nameMatch = attempt.student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const completionMatch =
      completionFilter === 'all'
        ? true
        : completionFilter === 'completed'
          ? attempt.score !== null
          : attempt.score === null;

    const attemptDate = new Date(attempt.createdAt);
    const start = startOfDay(parseDate(startDate));
    const end = endOfDay(parseDate(endDate));
    const dateMatch = attemptDate >= start && attemptDate <= end;

    return nameMatch && completionMatch && dateMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-800 text-white" id="page-content">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/grid.svg)' }}></div>
      <div className="container mx-auto p-4 md:p-8 relative">
        <Link
          href="/teacher"
          id="back-button"
          className="no-print inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 rounded-full px-4 py-2 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para o Painel
        </Link>

        <header className="mb-10">
          <h1 className="text-4xl font-bold">{data.activity.title}</h1>
          <p className="text-white/60 mt-2">
            Visualizando as tentativas dos alunos para esta atividade. <br className="sm:hidden" />
            <span className="font-semibold">Período de {format(parseDate(startDate), 'dd/MM/yyyy')} a {format(parseDate(endDate), 'dd/MM/yyyy')}</span>
          </p>
        </header>

        <div id="filter-section" className="mb-6 flex flex-wrap justify-end gap-4 no-print">
          <div className="grid w-full sm:w-auto items-center gap-1.5">
            <Label htmlFor="student_filter" className="text-white/80">
              Filtrar por Aluno
            </Label>
            <Input
              id="student_filter"
              type="text"
              placeholder="Nome do aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border-white/20 backdrop-blur-md text-white placeholder:text-white/50"
            />
          </div>
          <div className="grid w-full sm:w-auto items-center gap-1.5">
            <Label className="text-white/80">Status</Label>
            <Select value={completionFilter} onValueChange={setCompletionFilter}>
              <SelectTrigger className="bg-white/10 border-white/20 backdrop-blur-md text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-950/80 backdrop-blur-lg border-white/20 text-white">
                <SelectItem value="all">Status (Todos)</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="not-completed">Não Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full sm:w-auto items-center gap-1.5">
            <Label htmlFor="start_date" className="text-white/80">Data de Início</Label>
            <Input
              id="start_date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white/10 border-white/20 backdrop-blur-md text-white"
            />
          </div>
          <div className="grid w-full sm:w-auto items-center gap-1.5">
            <Label htmlFor="end_date" className="text-white/80">Data de Fim</Label>
            <Input
              id="end_date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white/10 border-white/20 backdrop-blur-md text-white"
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
                <TableHead className="text-white/80">Aluno</TableHead>
                <TableHead className="text-white/80">Data</TableHead>
                <TableHead className="text-white/80">Status</TableHead>
                <TableHead className="text-right text-white/80">Pontuação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttempts.length > 0 ? (
                filteredAttempts.map((attempt) => (
                  <TableRow key={attempt.id} className="border-b-white/10 hover:bg-white/5">
                    <TableCell className="font-medium text-white">{attempt.student.name}</TableCell>
                    <TableCell className="text-white/70">{format(new Date(attempt.createdAt), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>
                      {attempt.score !== null ? (
                        <CheckCircle size={18} className="text-green-400" />
                      ) : (
                        <XCircle size={18} className="text-red-400" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={`font-bold ${
                          attempt.score && attempt.score > 70
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : attempt.score !== null
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}
                      >
                        {attempt.score !== null ? `${attempt.score}%` : 'Não iniciado'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-48 text-white/50">
                    Nenhuma tentativa encontrada com os filtros atuais.
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
