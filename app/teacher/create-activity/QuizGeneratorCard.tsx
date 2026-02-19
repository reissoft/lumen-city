// app/teacher/create-activity/QuizGeneratorCard.tsx
"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardFooter, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUp, Bot, Loader2 } from "lucide-react"
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
        // CORREÇÃO: Adicionado o tipo 'any' ao parâmetro 'item' do map.
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

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsParsingFile(true);
        toast.info(`Processando o arquivo: ${file.name}`);

        try {
            let text = "";
            if (file.type === "application/pdf") {
                text = await parsePdf(file);
            } else if (file.type === "text/plain") {
                text = await parseTxt(file);
            } else {
                toast.error("Formato de arquivo não suportado. Use PDF ou TXT.");
                return;
            }
            setContextText(text);
            toast.success("Arquivo processado com sucesso!");
        } catch (error) {
            console.error("Erro ao processar arquivo:", error);
            toast.error("Falha ao processar o arquivo.");
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
    });

    const isDisabled = isGenerating || isParsingFile;

    return (
        <>
          <Card className={`hover:border-indigo-500/50 transition-all ${isDisabled ? 'opacity-50' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Bot className="text-indigo-600" />
                Gerar Quiz com IA
              </CardTitle>
              <CardDescription>
                Use o tema definido acima e gere um quiz automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-medium">Adicionar Contexto (Opcional)</p>
              
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'}`}>
                <input {...getInputProps()} />
                <FileUp className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                {isDragActive ?
                    <p>Solte o arquivo aqui...</p> :
                    <p>Arraste e solte um arquivo <span className="font-semibold">.PDF</span> ou <span className="font-semibold">.TXT</span> aqui, ou clique para selecionar.</p>
                }
                </div>

                {contextText && (
                    <div className="mt-4">
                        <Label>Texto Extraído do Arquivo</Label>
                        <Textarea 
                            value={contextText} 
                            readOnly 
                            rows={5} 
                            className="bg-slate-50 text-xs" 
                        />
                    </div>
                )}

              <div className="space-y-2">
                <Label htmlFor="additional-notes">Instruções Adicionais (Opcional)</Label>
                <Textarea
                  id="additional-notes"
                  placeholder="Ex: Crie perguntas mais difíceis, foque no sub-tópico X..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleGeneration(contextText, additionalNotes)} className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isDisabled || !topic}>
                {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Gerando...</> : isParsingFile ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processando...</> : 'Gerar Mágica ✨'}
              </Button>
            </CardFooter>
          </Card>
        </>
      );
    }