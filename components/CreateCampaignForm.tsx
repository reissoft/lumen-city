'use client'

import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BookOpen, Coins, Calendar, Loader2, Sparkles, Users, FileUp, FileText, X, Clock, Info } from "lucide-react"; // 👈 Info adicionado aqui
import { useDropzone } from "react-dropzone";

// Funções de leitura de arquivo
async function parsePdf(file: File): Promise<string> {
    const pdfjs = await import('pdfjs-dist/build/pdf');
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    let textContent = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map((item: any) => item.str).join(' ') + '\n';
    }

    return textContent;
}

async function parseTxt(file: File): Promise<string> {
    return file.text();
}

type ClassItem = { id: string; name: string };

export default function CreateCampaignForm({ teacherId, classes }: { teacherId: string, classes: ClassItem[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // 👇 NOVO: Controle do Modal de Ajuda
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [extractedText, setExtractedText] = useState<string>("");

  const [formData, setFormData] = useState({
    title: '',
    studyMaterial: '', 
    classId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rewardCoins: 500,
    dailyFrequency: 3
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsParsingFile(true);
      setFileName(file.name);
      toast.info(`Lendo arquivo: ${file.name}...`);

      try {
          let text = "";
          if (file.type === "application/pdf") {
              text = await parsePdf(file);
          } else if (file.type === "text/plain") {
              text = await parseTxt(file);
          } else {
              toast.error("Formato não suportado. Use PDF ou TXT.");
              setFileName(null);
              return;
          }
          
          setExtractedText(text);
          toast.success("Arquivo lido com sucesso! O conteúdo será enviado para a IA.");
      } catch (error) {
          console.error("Erro ao processar arquivo:", error);
          toast.error("Falha ao ler o texto do arquivo.");
          setFileName(null);
          setExtractedText("");
      } finally {
          setIsParsingFile(false);
      }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
          'application/pdf': ['.pdf'],
          'text/plain': ['.txt'],
      },
      maxFiles: 1,
      disabled: isParsingFile || isSubmitting
  });

  const handleRemoveFile = () => {
      setFileName(null);
      setExtractedText(""); 
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalMaterial = [extractedText, formData.studyMaterial].filter(Boolean).join('\n\n---\n\n');

    if (!finalMaterial.trim()) {
      toast.error("Você precisa fornecer um material de estudo (digitar ou enviar arquivo).");
      return;
    }

    if (!formData.classId) {
      toast.error("Por favor, selecione uma Turma!");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          studyMaterial: finalMaterial, 
          teacherId: teacherId
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Campanha de Estudo criada com sucesso! 🚀");
        setFormData({ ...formData, title: '', studyMaterial: '', classId: '', dailyFrequency: 3 });
        setFileName(null);
        setExtractedText("");
      } else {
        toast.error(data.error || "Erro ao criar campanha.");
      }
    } catch (error) {
      toast.error("Erro de conexão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormEmpty = !formData.studyMaterial.trim() && !extractedText;

  return (
    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-200">
      
      {/* 👇 Cabeçalho atualizado com o botão de Ajuda 👇 */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
            <Sparkles className="text-indigo-400 w-8 h-8" />
            <div>
            <h2 className="text-2xl font-bold text-white">Nova Campanha de Estudo</h2>
            <p className="text-slate-400 text-sm">A IA vai gerar desafios para os alunos baseada no texto que você fornecer.</p>
            </div>
        </div>
        
        <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowHelpModal(true)}
            className="gap-2 bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 rounded-full"
        >
            <Info size={18} /> Ajuda
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 font-semibold text-slate-300 mb-2">
              <BookOpen size={18} /> Título da Campanha
            </label>
            <Input 
              required
              placeholder="Ex: Revolução Francesa"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="bg-slate-950 border-slate-700"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold text-slate-300 mb-2">
              <Users size={18} /> Turma Alvo
            </label>
            <select
              required
              value={formData.classId}
              onChange={(e) => setFormData({...formData, classId: e.target.value})}
              className="w-full h-10 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>Selecione uma turma...</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 font-semibold text-slate-300">
            📝 Material Base
          </label>
          
          {!fileName && (
              <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-xl p-4 md:p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-950/50'}`}>
                  <input {...getInputProps()} />
                  <FileUp className="mx-auto h-8 w-8 text-slate-500 mb-2" />
                  {isDragActive ?
                      <p className="text-indigo-400 font-medium">Solte o arquivo aqui...</p> :
                      <p className="text-sm text-slate-400">Arraste um <span className="font-bold text-slate-300">.PDF</span> ou <span className="font-bold text-slate-300">.TXT</span> aqui, ou clique para fazer upload.</p>
                  }
                  {isParsingFile && <p className="text-indigo-400 text-sm mt-2 flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin"/> Lendo documento...</p>}
              </div>
          )}

          {fileName && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/20 rounded-md">
                        <FileText size={20} className="text-indigo-400"/>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200 truncate max-w-[200px] md:max-w-md">{fileName}</p>
                        <p className="text-xs text-emerald-400">Conteúdo armazenado. Pronto para a IA!</p>
                      </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8">
                      <X size={18} />
                  </Button>
              </div>
          )}

          <textarea 
            placeholder={fileName ? "Adicione instruções extras ou contexto (Opcional)" : "Digite ou cole o texto aqui (Opcional se enviar um arquivo acima)..."}
            value={formData.studyMaterial}
            onChange={(e) => setFormData({...formData, studyMaterial: e.target.value})}
            className="w-full h-32 bg-slate-950 border border-slate-700 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none shadow-inner"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-1"><Calendar size={14}/> Início</label>
            <Input 
              type="date" required
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              className="bg-slate-900 border-slate-700 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-1"><Calendar size={14}/> Fim</label>
            <Input 
              type="date" required
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              className="bg-slate-900 border-slate-700 [color-scheme:dark]"
            />
          </div>
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
            <label className="flex items-center gap-2 text-sm text-yellow-500 mb-1"><Coins size={14}/> Moedas por acerto</label>
            <Input 
              type="number" required min="50" step="50"
              value={formData.rewardCoins}
              onChange={(e) => setFormData({...formData, rewardCoins: parseInt(e.target.value)})}
              className="bg-slate-900 border-slate-700 font-mono text-yellow-400"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting || isParsingFile || isFormEmpty || !formData.classId}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 text-lg font-bold"
          >
            {isSubmitting ? <><Loader2 className="animate-spin mr-2" /> Salvando...</> : "Lançar Campanha!"}
          </Button>
        </div>

      </form>

      {/* --- 👇 MODAL DE AJUDA DAS CAMPANHAS 👇 --- */}
      {showHelpModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
                  
                  <div className="bg-indigo-600/20 border-b border-indigo-500/20 p-6 flex justify-between items-start relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                      <div className="relative z-10">
                          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                              <Sparkles className="text-indigo-400" /> O Sistema de Campanhas IA
                          </h2>
                          <p className="text-indigo-200/80 text-sm mt-1">Como transformar textos em gameplay contínuo.</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white hover:bg-slate-800 relative z-10 rounded-full">
                          <X size={24} />
                      </Button>
                  </div>

                  <div className="p-6 md:p-8 space-y-6 text-slate-300">
                      <div className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-400">1</div>
                          <div>
                              <h3 className="text-lg font-bold text-white mb-1">O Material de Estudo</h3>
                              <p className="text-sm text-slate-400">O professor faz upload de um PDF ou cola um texto contendo o assunto que os alunos precisam estudar (ex: Revolução Francesa).</p>
                          </div>
                      </div>

                      <div className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-xl font-bold text-indigo-400">2</div>
                          <div>
                              <h3 className="text-lg font-bold text-white mb-1">A Mágica da IA</h3>
                              <p className="text-sm text-slate-400">Nosso sistema usa Inteligência Artificial para ler esse texto e gerar perguntas inéditas de múltipla escolha toda vez que for acionado, baseadas 100% no seu conteúdo.</p>
                          </div>
                      </div>

                      <div className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-xl font-bold text-blue-400">3</div>
                          <div>
                              <h3 className="text-lg font-bold text-white mb-1">A Interrupção no Jogo</h3>
                              <p className="text-sm text-slate-400">Enquanto o aluno joga e constrói a cidade 3D, o "Conselheiro" o interrompe magicamente para fazer uma pergunta. Isso garante que ele estude de forma gamificada sem sair do jogo.</p>
                          </div>
                      </div>

                      <div className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-xl font-bold text-yellow-500">4</div>
                          <div>
                              <h3 className="text-lg font-bold text-white mb-1">Frequência e Recompensas</h3>
                              <p className="text-sm text-slate-400">A interrupção acontece com base no campo <strong>Vezes ao dia</strong> que você definiu. Acertar a pergunta concede moedas para o aluno. Se ele errar, a IA explica o erro com base no seu texto!</p>
                          </div>
                      </div>
                  </div>

                  <div className="bg-slate-950/50 p-6 flex justify-end">
                      <Button type="button" onClick={() => setShowHelpModal(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 font-bold rounded-full">
                          Entendi!
                      </Button>
                  </div>
              </div>
          </div>
      )}
      {/* --- 👆 FIM DO MODAL DE AJUDA 👆 --- */}
    </div>
  );
}