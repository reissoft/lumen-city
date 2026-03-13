'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BookOpen, Coins, Calendar, Loader2, Sparkles, Users, ArrowLeft, Clock } from "lucide-react"; // 👈 Adicionei o Clock
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditCampaignForm({ campaign, classes }: { campaign: any, classes: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Já inicia com os dados que vieram do banco
  const [formData, setFormData] = useState({
    title: campaign.title,
    studyMaterial: campaign.studyMaterial,
    classId: campaign.classes[0]?.id || '',
    startDate: new Date(campaign.startDate).toISOString().split('T')[0],
    endDate: new Date(campaign.endDate).toISOString().split('T')[0],
    rewardCoins: campaign.rewardCoins,
    dailyFrequency: campaign.dailyFrequency || 3 // 👈 Carrega do banco ou usa 3 como padrão
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Campanha atualizada com sucesso! 🚀");
        router.push('/teacher'); // Volta pro dashboard do professor
        router.refresh(); // Força o painel a recarregar as informações novas
      } else {
        toast.error(data.error || "Erro ao atualizar campanha.");
      }
    } catch (error) {
      toast.error("Erro de conexão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-200 mt-8">
      <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
        <Link href="/teacher">
            <Button variant="ghost" size="icon" className="hover:bg-slate-800 text-slate-400 hover:text-white rounded-full">
                <ArrowLeft size={20} />
            </Button>
        </Link>
        <Sparkles className="text-indigo-400 w-8 h-8" />
        <div>
          <h2 className="text-2xl font-bold text-white">Editar Campanha</h2>
          <p className="text-slate-400 text-sm">Ajuste os detalhes da missão para seus alunos.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 font-semibold text-slate-300 mb-2"><BookOpen size={18} /> Título</label>
            <Input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-slate-950 border-slate-700" />
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold text-slate-300 mb-2"><Users size={18} /> Turma Alvo</label>
            <select required value={formData.classId} onChange={(e) => setFormData({...formData, classId: e.target.value})} className="w-full h-10 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="" disabled>Selecione uma turma...</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 font-semibold text-slate-300">📝 Material Base</label>
          <textarea required value={formData.studyMaterial} onChange={(e) => setFormData({...formData, studyMaterial: e.target.value})} className="w-full h-48 bg-slate-950 border border-slate-700 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none shadow-inner" />
        </div>

        {/* 👇 Ajustado para grid-cols-4 para caber a Frequência 👇 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-1"><Calendar size={14}/> Início</label>
            <Input type="date" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="bg-slate-900 border-slate-700 [color-scheme:dark]" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-1"><Calendar size={14}/> Fim</label>
            <Input type="date" required value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="bg-slate-900 border-slate-700 [color-scheme:dark]" />
          </div>
          
          {/* 👇 CAMPO VEZES AO DIA 👇 */}
          <div>
            <label className="flex items-center gap-2 text-sm text-blue-400 mb-1"><Clock size={14}/> Vezes ao dia</label>
            <Input 
              type="number" required min="1" max="15" step="1"
              value={formData.dailyFrequency} 
              onChange={(e) => setFormData({...formData, dailyFrequency: parseInt(e.target.value)})} 
              className="bg-slate-900 border-slate-700 font-mono text-blue-300" 
              title="Quantas vezes a IA vai chamar o aluno durante o dia"
            />
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-sm text-yellow-500 mb-1"><Coins size={14}/> Moedas (Acerto)</label>
            <Input type="number" required min="50" step="50" value={formData.rewardCoins} onChange={(e) => setFormData({...formData, rewardCoins: parseInt(e.target.value)})} className="bg-slate-900 border-slate-700 font-mono text-yellow-400" />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button type="submit" disabled={isSubmitting || !formData.studyMaterial.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 text-lg font-bold">
            {isSubmitting ? <><Loader2 className="animate-spin mr-2" /> Salvando...</> : "Atualizar Campanha"}
          </Button>
        </div>

      </form>
    </div>
  );
}