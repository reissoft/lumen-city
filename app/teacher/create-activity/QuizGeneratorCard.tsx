"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Wand2, Loader2, UploadCloud, File, X, AlertTriangle } from "lucide-react"
import mammoth from "mammoth"

// Importações da react-pdf
import { Document, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configuração do worker, necessária para a react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface QuizGeneratorCardProps {
  topic: string;
  isGenerating: boolean;
  handleGeneration: (contextText: string) => void;
}

export default function QuizGeneratorCard({ topic, isGenerating, handleGeneration }: QuizGeneratorCardProps) {
  const [file, setFile] = useState<File | null>(null)
  const [contextText, setContextText] = useState("")
  const [fileError, setFileError] = useState<string | null>(null)
  const [isParsingFile, setIsParsingFile] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false) // Novo estado para o drag-and-drop

  const onDocumentLoadSuccess = useCallback(async (pdf: any) => {
    setIsParsingFile(true);
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
    }
    setContextText(fullText);
    setIsParsingFile(false);
  }, []);

  useEffect(() => {
    if (!file) return;

    setIsParsingFile(true);
    setFileError(null);
    setContextText('');
    const reader = new FileReader();

    if (file.type === 'text/plain') {
      reader.onload = (e) => {
        setContextText(e.target?.result as string);
        setIsParsingFile(false);
      };
      reader.readAsText(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      reader.onload = async (e) => {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: e.target?.result as ArrayBuffer });
          setContextText(result.value);
        } catch (err) {
          setFileError("DOCX corrompido ou inválido.");
        } finally {
          setIsParsingFile(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (file.type !== 'application/pdf') {
      setFileError("Formato de arquivo não suportado.");
      setIsParsingFile(false);
    }
  }, [file]);

  const processFile = (selectedFile: File) => {
    const acceptedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (acceptedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
    } else {
        setFileError("Formato de arquivo não suportado.");
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      processFile(event.target.files[0]);
    }
    event.target.value = '';
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setContextText("");
    setFileError(null);
  };

  // Funções para Drag and Drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!isDisabled) setIsDraggingOver(true);
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDraggingOver(false);
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDraggingOver(false);
      if (isDisabled || !e.dataTransfer.files?.[0]) return;
      processFile(e.dataTransfer.files[0]);
  }
  
  const isDisabled = isGenerating || isParsingFile;

  return (
    <>
      {file && file.type === 'application/pdf' && (
        <div style={{ display: 'none' }}>
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={() => setFileError("PDF corrompido, protegido por senha ou inválido.")}
            loading="">
          </Document>
        </div>
      )}

      <Card className={`hover:border-indigo-500/50 transition-all ${isDisabled ? 'opacity-50' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3"><Wand2 className="text-indigo-600" />Gerar Quiz com IA</CardTitle>
          <CardDescription>Defina um tema ou envie um arquivo para a IA criar a atividade.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3">
              <Label>Baseado em Arquivo (Opcional)</Label>
              <div 
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${isDraggingOver ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-300'} ${!isDisabled ? 'cursor-pointer hover:border-indigo-400' : ''}`}
                  onClick={() => !isDisabled && document.getElementById('file-upload')?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
              >
                  <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.txt,.docx" disabled={isDisabled} />
                  {isParsingFile ? (
                      <div className="flex flex-col items-center gap-2 text-slate-700"><Loader2 className="w-8 h-8 animate-spin" /><span>Processando...</span></div>
                  ) : file ? (
                      <div className="flex flex-col items-center gap-2 text-slate-700">
                          <File className="w-8 h-8" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <Button variant="ghost" size="sm" className="absolute top-2 right-2 text-slate-500 hover:text-red-500" onClick={handleRemoveFile}><X size={16}/></Button>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                          <UploadCloud className="w-8 h-8" />
                          <span className="font-semibold">Clique ou arraste um arquivo</span>
                          <span className="text-xs">PDF, TXT, DOCX</span>
                      </div>
                  )}
              </div>
              {fileError && <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md"><AlertTriangle size={16} /><span>{fileError}</span></div>}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => handleGeneration(contextText)} className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isDisabled || !topic}>
            {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Gerando...</> : isParsingFile ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processando...</> : 'Gerar Mágica ✨'}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
