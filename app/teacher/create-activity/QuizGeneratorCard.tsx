// app/teacher/create-activity/QuizGeneratorCard.tsx
"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUp, Bot, Loader2, FileText, X } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"

interface QuizGeneratorCardProps {
    topic: string;
    isGenerating: boolean;
    handleGeneration: (contextText: string, additionalNotes: string) => void;
}

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

export default function QuizGeneratorCard({ topic, isGenerating, handleGeneration }: QuizGeneratorCardProps) {
    const [contextText, setContextText] = useState("");
    const [additionalNotes, setAdditionalNotes] = useState("");
    const [isParsingFile, setIsParsingFile] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsParsingFile(true);
        setFileName(file.name);
        toast.info(`Processando o arquivo: ${file.name}`);

        try {
            let text = "";
            if (file.type === "application/pdf") {
                text = await parsePdf(file);
            } else if (file.type === "text/plain") {
                text = await parseTxt(file);
            } else {
                toast.error("Formato de arquivo não suportado. Use PDF ou TXT.");
                setFileName(null);
                return;
            }
            setContextText(text);
            toast.success("Arquivo processado e contexto preenchido!");
        } catch (error) {
            console.error("Erro ao processar arquivo:", error);
            toast.error("Falha ao processar o arquivo.");
            setFileName(null);
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
        disabled: isParsingFile || isGenerating
    });

    const isDisabled = isGenerating || isParsingFile;

    const handleRemoveFile = () => {
        setContextText("");
        setFileName(null);
    }

    return (
        <div className="flex flex-col p-6 md:p-8 h-full">
            <header className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Bot className="text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold">Gerar Quiz com IA</h3>
                </div>
                <p className="text-white/60 ml-1">
                    Envie um arquivo de contexto (opcional) e deixe a IA criar a atividade.
                </p>
            </header>
            
            <div className="space-y-4 my-6">
                {!contextText && (
                    <div 
                        {...getRootProps()} 
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-400 bg-white/10' : 'border-white/20 hover:border-white/40'}`}>
                        <input {...getInputProps()} />
                        <FileUp className="mx-auto h-8 w-8 text-white/40 mb-2" />
                        {isDragActive ?
                            <p className="text-blue-300">Solte o arquivo aqui...</p> :
                            <p className="text-sm text-white/60">Arraste e solte um <span className="font-semibold text-white/80">.PDF</span> ou <span className="font-semibold text-white/80">.TXT</span></p>
                        }
                    </div>
                )}
                
                {fileName && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText size={16} className="text-white/60"/>
                            <span className="text-sm text-white/80 truncate">{fileName}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="text-white/60 hover:text-white hover:bg-white/10 h-7 w-7">
                            <X size={16} />
                        </Button>
                    </div>
                )}

                <div>
                    <Label htmlFor="additional-notes" className="text-sm font-medium text-white/80 mb-2 block">Instruções Adicionais (Opcional)</Label>
                    <Textarea
                        id="additional-notes"
                        placeholder="Ex: Foque no sub-tópico X, crie perguntas mais difíceis..."
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        rows={2}
                        className="w-full bg-white/5 border-2 border-white/20 rounded-lg p-2.5 text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition"
                        disabled={isDisabled}
                    />
                </div>
            </div>

            <footer className="mt-auto">
                <Button onClick={() => handleGeneration(contextText, additionalNotes)} className="w-full font-bold py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-transform" disabled={isDisabled || !topic}>
                    {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Gerando...</> : isParsingFile ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processando...</> : 'Gerar com IA ✨'}
                </Button>
            </footer>
        </div>
      );
    }