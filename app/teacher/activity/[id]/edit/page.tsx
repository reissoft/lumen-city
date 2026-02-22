// app/teacher/activity/[id]/edit/page.tsx
"use client"

import { useState, useEffect, useTransition, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Trash2, Save, Loader2, Link as LinkIcon, Users, BookOpen, Check, FileText, Image as ImageIcon, Youtube } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { getActivityById, updateQuiz } from "@/app/actions"
import { getTeacherClasses } from "@/app/teacher/create-activity/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// --- Estruturas de Dados ---
interface QuestionState { id: number; text: string; options: { id: number; text: string }[]; correctAnswerId: number; }
interface ReviewMaterialState { id: number; url: string; type: string; }
type ClassState = { id: string; name: string; };

// --- Estilos ---
const cardStyles = `bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg`;
const inputStyles = `w-full bg-white/5 border-2 border-white/20 rounded-lg p-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition`;
const labelStyles = `font-semibold text-white/80 text-sm`;

function EditQuizPageContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string

  // --- Estados ---
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<QuestionState[]>([])
  const [reviewMaterials, setReviewMaterials] = useState<ReviewMaterialState[]>([])
  const [allTeacherClasses, setAllTeacherClasses] = useState<ClassState[]>([])
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [newLink, setNewLink] = useState("");
  const [loading, setLoading] = useState(true)
  const [isSaving, startTransition] = useTransition()

  // --- Carregamento de Dados ---
  useEffect(() => {
    if (searchParams.get("created") === "true") {
      toast.success("Atividade criada com sucesso!");
      router.replace(`/teacher/activity/${id}/edit`, { scroll: false });
    }

    if (!id) return

    Promise.all([
        getActivityById(id),
        getTeacherClasses()
    ]).then(([activity, teacherClasses]) => {
        setTitle(activity.title)
        setDescription(activity.description || "")
        const activityQuestions = (activity.payload as any)?.questions || []
        setQuestions(activityQuestions.map((q: any, index: number) => ({ id: Date.now() + index, text: q.text, options: q.options.map((opt: string, i: number) => ({ id: i + 1, text: opt })), correctAnswerId: q.correct + 1 })));
        
        const dbMaterials = (activity.reviewMaterials as any[]) || [];
        setReviewMaterials(dbMaterials.map((mat: any, index) => ({ id: Date.now() + index, url: mat.url, type: mat.type })));

        setAllTeacherClasses(teacherClasses);
        const associatedClassIds = activity.classes.map((cls: { id: string }) => cls.id);
        setSelectedClasses(associatedClassIds);

    }).catch(err => {
        console.error(err)
        toast.error("Não foi possível carregar os dados da atividade.")
        router.push('/teacher')
    }).finally(() => {
        setLoading(false)
    });

  }, [id, router, searchParams])

  // --- Manipuladores de State ---
  const handleClassSelection = (classId: string) => {
    setSelectedClasses(prev => prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]);
  };

  const addQuestion = () => setQuestions([...questions, { id: Date.now(), text: "", options: [{ id: 1, text: "" }, { id: 2, text: "" }, { id: 3, text: "" }, { id: 4, text: "" }], correctAnswerId: 1 }]);
  const removeQuestion = (qId: number) => { if (questions.length > 1) setQuestions(questions.filter((q) => q.id !== qId)) };
  const handleQuestionTextChange = (qId: number, text: string) => setQuestions(questions.map(q => q.id === qId ? { ...q, text } : q));
  const handleOptionChange = (qId: number, oId: number, text: string) => setQuestions(questions.map(q => q.id === qId ? { ...q, options: q.options.map(o => o.id === oId ? { ...o, text } : o) } : q));
  const setCorrectAnswer = (qId: number, oId: number) => setQuestions(questions.map(q => q.id === qId ? { ...q, correctAnswerId: oId } : q));

  const addReviewMaterial = () => {
    if (!newLink.trim() || !newLink.startsWith('http')) { toast.warning("Por favor, insira um link válido (começando com http)."); return; }
    const lowerUrl = newLink.toLowerCase();
    let type: ReviewMaterialState['type'] = 'link';
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) { type = 'youtube'; }
    else if (lowerUrl.endsWith('.pdf')) { type = 'pdf'; }
    else if (lowerUrl.endsWith('.png') || lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.gif') || lowerUrl.endsWith('.webp')) { type = 'image'; }

    setReviewMaterials([...reviewMaterials, { id: Date.now(), url: newLink, type }]);
    setNewLink("");
  };
  const removeReviewMaterial = (mId: number) => setReviewMaterials(reviewMaterials.filter(m => m.id !== mId));
  
  // --- Salvamento ---
  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("O título é obrigatório."); return; }
    if (selectedClasses.length === 0) { toast.error("Selecione ao menos uma turma."); return; }

    const formattedQuestions = questions.map(q => ({ text: q.text, options: q.options.map(opt => opt.text), correct: q.correctAnswerId - 1 }));
    const materialsToSave = reviewMaterials.map(({ url, type }) => ({ url, type }));

    startTransition(async () => {
      try {
        await updateQuiz(id, title, description, formattedQuestions, materialsToSave, selectedClasses);
        toast.success("Atividade salva com sucesso!")
        router.push('/teacher');
      } catch (error) {
        toast.error("Ocorreu um erro ao salvar a atividade.")
      }
    });
  }

  const materialIcons: { [key: string]: React.ElementType } = { youtube: Youtube, pdf: FileText, image: ImageIcon, link: LinkIcon };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
        <div className="flex items-center gap-3 text-white/80"><Loader2 className="h-6 w-6 animate-spin"/><p className="font-semibold text-lg">Carregando Editor...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
        <div className="max-w-4xl mx-auto p-4 md:p-8 relative space-y-8">

            <header className="flex items-center justify-between">
                <Button variant="outline" onClick={() => router.push('/teacher')} className="gap-2 rounded-full bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-colors"><ArrowLeft size={16} />Voltar</Button>
                <h1 className="text-3xl font-bold">Editar Atividade</h1>
                <div className="w-24"></div>
            </header>

            <div className={`${cardStyles} p-6 md:p-8 space-y-6`}>
                <h2 className="text-xl font-bold text-white">Informações Gerais</h2>
                <div className="space-y-2"><Label htmlFor="quiz-title" className={labelStyles}>Título da Atividade</Label><Input id="quiz-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSaving} className={inputStyles} placeholder="Ex: Conquista da América"/></div>
                <div className="space-y-2"><Label htmlFor="quiz-description" className={labelStyles}>Descrição</Label><Textarea id="quiz-description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSaving} className={cn(inputStyles, 'min-h-[80px]')} placeholder="Um breve resumo sobre o conteúdo desta missão."/></div>
            </div>

            <div className={`${cardStyles} p-6 md:p-8 space-y-4`}>
                <h2 className="text-xl font-bold text-white flex items-center gap-3"><Users /> Turmas</h2>
                <p className="text-white/60 -mt-2">Escolha para quais turmas esta atividade será aplicada.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">{allTeacherClasses.length > 0 ? (allTeacherClasses.map(cls => (
                    <div key={cls.id} className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border-2 border-transparent has-[:checked]:border-blue-500/50 has-[:checked]:bg-blue-900/20 transition-all">
                        <Checkbox id={`class-${cls.id}`} onCheckedChange={() => handleClassSelection(cls.id)} checked={selectedClasses.includes(cls.id)} disabled={isSaving} className="border-white/50"/>
                        <Label htmlFor={`class-${cls.id}`} className="font-normal text-white/90 cursor-pointer">{cls.name}</Label>
                    </div>
                ))) : (<p className="text-sm text-white/50 col-span-full">Nenhuma turma encontrada.</p>)}</div>
            </div>

            <div className={`${cardStyles} p-6 md:p-8 space-y-4`}>
                <h2 className="text-xl font-bold text-white flex items-center gap-3"><BookOpen/> Materiais de Revisão</h2>
                <div className="flex gap-2"><Input value={newLink} onChange={(e) => setNewLink(e.target.value)} placeholder="Cole um link do YouTube, um PDF ou qualquer outra URL" disabled={isSaving} className={inputStyles} /><Button onClick={addReviewMaterial} disabled={isSaving} className="bg-white/10 hover:bg-white/20 shrink-0">Adicionar</Button></div>
                <div className="space-y-2 pt-2">{reviewMaterials.map(m => {
                    const Icon = materialIcons[m.type] || LinkIcon;
                    return (
                    <div key={m.id} className="flex items-center justify-between p-3 pl-4 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3 min-w-0">
                            <Icon className="h-5 w-5 text-blue-300 shrink-0" />
                            <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-sm text-white/80 truncate flex-shrink min-w-0">{m.url}</a>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeReviewMaterial(m.id)} disabled={isSaving} className="hover:bg-red-500/10 rounded-full"><Trash2 size={16} className="text-red-400" /></Button>
                    </div>
                )})}</div>
            </div>

            {questions.map((q, index) => (
            <div key={q.id} className={`${cardStyles} p-6 md:p-8 space-y-4 relative`}>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Questão {index + 1}</h3>
                    {questions.length > 1 && (<Button variant="ghost" size="icon" className="absolute top-6 right-6 hover:bg-red-500/10 rounded-full" onClick={() => removeQuestion(q.id)} disabled={isSaving}><Trash2 size={18} className="text-red-400" /></Button>)}
                </div>
                <Textarea value={q.text} onChange={(e) => handleQuestionTextChange(q.id, e.target.value)} disabled={isSaving} className={cn(inputStyles, 'min-h-[100px]')} placeholder={`Texto da questão ${index + 1}`}/>
                
                <div className="space-y-3 pt-2">
                    {q.options.map((opt) => {
                        const isCorrect = q.correctAnswerId === opt.id;
                        return (
                            <div key={opt.id} className="flex items-center gap-2">
                                <Input value={opt.text} onChange={(e) => handleOptionChange(q.id, opt.id, e.target.value)} className={cn(inputStyles, { 'border-green-500/50 bg-green-900/10': isCorrect })} disabled={isSaving} placeholder={`Opção ${opt.id}`}/>
                                <Button variant={isCorrect ? "default" : "outline"} onClick={() => setCorrectAnswer(q.id, opt.id)} disabled={isSaving} className={cn('gap-2', isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-white/5 hover:bg-white/10')}>
                                    <Check size={16}/> Correta
                                </Button>
                            </div>
                        )
                    })}
                </div>
            </div>))}

            <footer className="flex justify-between items-center mt-6">
                <Button onClick={addQuestion} variant="outline" className="gap-2 font-semibold bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20" disabled={isSaving}><Plus size={16} />Adicionar Questão</Button>
                <Button onClick={handleSubmit} className="gap-2 font-bold rounded-full text-lg px-8 py-5 bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-transform" disabled={isSaving || loading}>{isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save size={16} /> Salvar Alterações</>}</Button>
            </footer>
        </div>
    </div>
  )
}

export default function EditQuizPage() {
    return (
        <Suspense fallback={
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
                <Loader2 className="h-8 w-8 text-white animate-spin"/>
            </div>
        }>
            <EditQuizPageContent />
        </Suspense>
    );
}
