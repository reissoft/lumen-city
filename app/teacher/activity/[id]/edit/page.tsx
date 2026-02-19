// app/teacher/activity/[id]/edit/page.tsx
"use client"

import { useState, useEffect, useTransition, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Trash2, Save, Loader2, Link as LinkIcon, Users } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { getActivityById, updateQuiz } from "@/app/actions"
import { getTeacherClasses } from "@/app/teacher/create-activity/actions"
import { toast } from "sonner"

// --- Estruturas de Dados ---
interface QuestionState { id: number; text: string; options: { id: number; text: string }[]; correctAnswerId: number; }
interface ReviewMaterialState { id: number; url: string; type: string; }
type ClassState = { id: string; name: string; };

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
        // Processa a atividade
        setTitle(activity.title)
        setDescription(activity.description || "")
        const activityQuestions = (activity.payload as any)?.questions || []
        setQuestions(activityQuestions.map((q: any, index: number) => ({ id: Date.now() + index, text: q.text, options: q.options.map((opt: string, i: number) => ({ id: i + 1, text: opt })), correctAnswerId: q.correct + 1 })));
        
        const dbMaterials = (activity.reviewMaterials as any[]) || [];
        setReviewMaterials(dbMaterials.map((mat: any, index) => ({ id: Date.now() + index, url: mat.url, type: mat.type })));

        // Processa as turmas
        setAllTeacherClasses(teacherClasses);
        const associatedClassIds = activity.classes.map((cls: { id: string }) => cls.id);
        setSelectedClasses(associatedClassIds);

    }).catch(err => {
        console.error(err)
        toast.error("Não foi possível carregar os dados.")
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
    if (!newLink.trim() || !newLink.startsWith('http')) { toast.warning("Por favor, insira um link válido."); return; }
    const type = newLink.includes('youtube') ? 'youtube' : 'link';
    setReviewMaterials([...reviewMaterials, { id: Date.now(), url: newLink, type }]);
    setNewLink("");
  };
  const removeReviewMaterial = (mId: number) => setReviewMaterials(reviewMaterials.filter(m => m.id !== mId));
  
  // --- Salvamento ---
  const handleSubmit = async () => {
    if (!title.trim() || selectedClasses.length === 0) {
        toast.warning("O título e a seleção de ao menos uma turma são obrigatórios.");
        return;
    }

    const formattedQuestions = questions.map(q => ({ text: q.text, options: q.options.map(opt => opt.text), correct: q.correctAnswerId - 1 }));
    const materialsToSave = reviewMaterials.map(({ url, type }) => ({ url, type }));

    startTransition(() => {
      // Passa a lista de IDs de turmas para a action
      updateQuiz(id, title, description, formattedQuestions, materialsToSave, selectedClasses);
    });
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
           <Button variant="ghost" onClick={() => router.push('/teacher')} className="gap-2"><ArrowLeft size={16} />Voltar</Button>
           <h1 className="text-2xl font-bold text-slate-800">Editar Quiz</h1>
           <div /> 
        </div>

        <Card className="mb-6"><CardHeader><CardTitle>Informações Gerais</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label htmlFor="quiz-title">Título do Quiz</Label><Input id="quiz-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSaving} /></div><div><Label htmlFor="quiz-description">Descrição</Label><Textarea id="quiz-description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSaving} /></div></CardContent></Card>

        {/* CARD DE SELEÇÃO DE TURMAS */}
        <Card className="mb-8"><CardHeader><CardTitle className="flex items-center gap-3"><Users /> Turmas</CardTitle><CardDescription>Escolha para quais turmas esta atividade será aplicada.</CardDescription></CardHeader><CardContent className="space-y-3">{allTeacherClasses.length > 0 ? (allTeacherClasses.map(cls => (<div key={cls.id} className="flex items-center space-x-2"><Checkbox id={`class-${cls.id}`} onCheckedChange={() => handleClassSelection(cls.id)} checked={selectedClasses.includes(cls.id)} disabled={isSaving} /><Label htmlFor={`class-${cls.id}`} className="font-normal">{cls.name}</Label></div>))) : (<p className="text-sm text-slate-500">Nenhuma turma encontrada.</p>)}</CardContent></Card>

        <Card className="mb-6"><CardHeader><CardTitle>Materiais de Revisão</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex gap-2"><Input value={newLink} onChange={(e) => setNewLink(e.target.value)} placeholder="https://www.youtube.com/..." disabled={isSaving} /><Button onClick={addReviewMaterial} disabled={isSaving}>Adicionar</Button></div><div className="space-y-2">{reviewMaterials.map(m => (<div key={m.id} className="flex items-center justify-between p-2 bg-slate-100 rounded-md"><div className="flex items-center gap-2"><LinkIcon className="h-4 w-4" /><a href={m.url} target="_blank" rel="noopener noreferrer" className="text-sm truncate">{m.url}</a></div><Button variant="ghost" size="icon" onClick={() => removeReviewMaterial(m.id)} disabled={isSaving}><Trash2 size={16} /></Button></div>))}</div></CardContent></Card>

        {questions.map((q, index) => (<Card key={q.id} className="mb-4 relative"><CardHeader><CardTitle>Questão {index + 1}</CardTitle>{questions.length > 1 && (<Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => removeQuestion(q.id)} disabled={isSaving}><Trash2 size={18} /></Button>)}</CardHeader><CardContent className="space-y-4"><Textarea value={q.text} onChange={(e) => handleQuestionTextChange(q.id, e.target.value)} disabled={isSaving} /><div className="space-y-2 pl-4 border-l-2">{q.options.map((opt) => (<div key={opt.id} className="flex items-center gap-2"><Input value={opt.text} onChange={(e) => handleOptionChange(q.id, opt.id, e.target.value)} className={q.correctAnswerId === opt.id ? "border-green-500" : ""} disabled={isSaving} /><Button variant={q.correctAnswerId === opt.id ? "default" : "outline"} onClick={() => setCorrectAnswer(q.id, opt.id)} disabled={isSaving}>Correta</Button></div>))}</div></CardContent></Card>))}

        <div className="flex justify-between mt-6"><Button onClick={addQuestion} variant="outline" className="gap-2" disabled={isSaving}><Plus size={16} />Adicionar Questão</Button><Button onClick={handleSubmit} className="gap-2" disabled={isSaving || loading}>{isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save size={16} /> Salvar Alterações</>}</Button></div>
      </div>
    </div>
  )
}

export default function EditQuizPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <EditQuizPageContent />
        </Suspense>
    );
}
