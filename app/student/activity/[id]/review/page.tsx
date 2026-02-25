// app/student/activity/[id]/review/page.tsx
"use client"

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getActivityById } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Link as LinkIcon, Youtube, FileText, Image as ImageIcon, ExternalLink, Music } from 'lucide-react';

interface ReviewMaterial {
  url: string;
  type: 'youtube' | 'link' | 'pdf' | 'image' | 'audio';
}

interface Activity {
  id: string;
  title: string;
  reviewMaterials?: ReviewMaterial[];
}

const cardStyles = `bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg`;

function YouTubeEmbed({ url }: { url: string }) {
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };
    const videoId = getYouTubeId(url);
    if (!videoId) return <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Link inválido do YouTube</a>;
    
    return (
        <div className="w-full aspect-video bg-black/30 rounded-2xl overflow-hidden">
            <iframe src={`https://www.youtube.com/embed/${videoId}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" title="YouTube video player"></iframe>
        </div>
    );
}

function PDFEmbed({ url }: { url: string }) {
    return (
        <div className="w-full h-[80vh] bg-black/30 rounded-2xl overflow-hidden border-2 border-white/10">
             <iframe src={url} className="w-full h-full" title={`PDF Viewer for ${url}`}></iframe>
        </div>
    )
}

function ImageEmbed({ url }: { url: string }) {
    return (
        <div className="w-full flex justify-center bg-black/30 p-4 rounded-2xl">
            <img src={url} alt="Material de revisão" className="max-w-full h-auto rounded-lg shadow-lg" />
        </div>
    );
}

function AudioEmbed({ url }: { url: string }) {
    return (
        <div className="w-full">
            <audio controls className="w-full rounded-lg">
                <source src={url} />
                Seu navegador não suporta o elemento de áudio.
            </audio>
        </div>
    );
}

function ReviewPageContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params.id as string;

    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        getActivityById(id)
            .then(data => {
                const dbMaterials = (data.reviewMaterials as any[]) || []; // Aceita qualquer tipo de array
                const parsedMaterials = dbMaterials.map(material => {
                     try {
                        // Se o material já for um objeto, retorna direto.
                        if (typeof material === 'object' && material !== null && material.url) {
                            return material;
                        }
                        // Tenta parsear se for uma string JSON.
                        return JSON.parse(material);
                    } catch (e) {
                        // Se falhar (não é JSON), trata como uma URL string simples (legado).
                        const urlString = String(material); // Garante que é uma string
                        const lowerUrl = urlString.toLowerCase();
                        if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
                            return { url: urlString, type: 'youtube' };
                        } else if (lowerUrl.endsWith('.pdf')) {
                            return { url: urlString, type: 'pdf' };
                        } else if (lowerUrl.endsWith('.mp3') || lowerUrl.endsWith('.wav') || lowerUrl.endsWith('.ogg')) {
                            return { url: urlString, type: 'audio' };
                        } else if (lowerUrl.endsWith('.png') || lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.gif') || lowerUrl.endsWith('.webp')) {
                            return { url: urlString, type: 'image' };
                        }
                        return { url: urlString, type: 'link' };
                    }
                });
                setActivity({ ...data, reviewMaterials: parsedMaterials });
            })
            .catch(err => {
                console.error("Failed to load activity:", err)
            })
            .finally(() => setLoading(false));
    }, [id]);

    const startQuiz = () => {
        const from = searchParams.get('from');
        const baseUrl = `/student/play/${id}`;
        const finalUrl = from ? `${baseUrl}?from=${from}` : baseUrl;
        router.push(finalUrl);
    };

    const loader = (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
            <div className="flex items-center gap-3 text-white/80">
                <Loader2 className="h-6 w-6 animate-spin"/>
                <p className="font-semibold text-lg">Carregando material de estudo...</p>
            </div>
        </div>
    );

    if (loading) return loader;

    if (!activity) {
        return <div className="text-center h-screen flex items-center justify-center text-white">Atividade não encontrada.</div>;
    }

    const typeMap: { [key in ReviewMaterial['type']]: { icon: any; label: string } } = {
        youtube: { icon: Youtube, label: "Vídeo do YouTube" },
        pdf: { icon: FileText, label: "Documento PDF" },
        image: { icon: ImageIcon, label: "Imagem" },
        audio: { icon: Music, label: "Áudio" },
        link: { icon: LinkIcon, label: "Link Externo" }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url(/grid.svg)'}}></div>
            <div className="container mx-auto max-w-4xl p-4 md:p-8 relative space-y-10">

                <header className="text-center space-y-2">
                    <p className="font-bold text-blue-300">Material de Estudo</p>
                    <h1 className="text-4xl md:text-5xl font-bold">Revisão para: {activity.title}</h1>
                    <p className="text-white/60 max-w-2xl mx-auto">Estude o conteúdo abaixo com atenção. Quando se sentir pronto, avance para o quiz!</p>
                </header>

                {activity.reviewMaterials && activity.reviewMaterials.length > 0 ? (
                    <div className="space-y-8">
                        {activity.reviewMaterials.map((material, index) => {
                            const { icon: Icon, label } = typeMap[material.type] || typeMap.link; // Fallback para o ícone de link
                            return (
                                <section key={index} className={`${cardStyles} p-6 md:p-8`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-white/10 p-2 rounded-lg"><Icon className="text-blue-300" size={20}/></div>
                                        <h2 className="text-xl font-bold">{label}</h2>
                                    </div>
                                    {material.type === 'youtube' && <YouTubeEmbed url={material.url} />}
                                    {material.type === 'pdf' && <PDFEmbed url={material.url} />}
                                    {material.type === 'image' && <ImageEmbed url={material.url} />}
                                    {material.type === 'audio' && <AudioEmbed url={material.url} />}
                                    {material.type === 'link' && (
                                        <a href={material.url} target="_blank" rel="noopener noreferrer" className="block p-6 bg-white/5 rounded-2xl hover:bg-white/10 border-2 border-white/10 hover:border-blue-400/50 transition-all group">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold text-blue-300 text-lg">Acessar Link Externo</p>
                                                    <p className="text-sm text-white/50 truncate max-w-md">{material.url}</p>
                                                </div>
                                                <ExternalLink className="text-white/50 group-hover:text-blue-300 transition-colors"/>
                                            </div>
                                        </a>
                                    )}
                                </section>
                            )
                        })}
                    </div>
                ) : (
                     <div className={`${cardStyles} p-12 text-center text-white/60`}>
                        <p className="font-bold text-lg">Nenhum material de revisão foi adicionado.</p>
                        <p className="text-sm mt-2">Você pode ir direto para o quiz!</p>
                    </div>
                )}
                
                <footer className="text-center pt-6">
                    <Button onClick={startQuiz} size="lg" className="h-14 px-10 text-lg font-bold gap-3 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 hover:scale-105 transition-transform">
                        Estou Pronto! <ArrowRight className="h-5 w-5" />
                    </Button>
                </footer>
            </div>
        </div>
    );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin"/>
            </div>
        }>
            <ReviewPageContent />
        </Suspense>
    )
}
