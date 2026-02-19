// app/student/activity/[id]/review/page.tsx
"use client"

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation'; // 1. Importar useSearchParams
import { getActivityById } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Loader2 } from 'lucide-react';

interface ReviewMaterial {
  url: string;
  type: 'youtube' | 'link' | 'pdf' | 'image';
}

interface Activity {
  id: string;
  title: string;
  reviewMaterials?: ReviewMaterial[];
}

function YouTubeEmbed({ url }: { url: string }) {
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };
    const videoId = getYouTubeId(url);
    if (!videoId) return <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link inválido do YouTube</a>;
    
    return (
        <div className="w-full aspect-video">
            <iframe src={`https://www.youtube.com/embed/${videoId}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full rounded-lg shadow-lg" title="YouTube video player"></iframe>
        </div>
    );
}

function PDFEmbed({ url }: { url: string }) {
    return (
        <div className="w-full h-[700px] border rounded-lg shadow-lg overflow-hidden">
             <iframe src={url} className="w-full h-full" title={`PDF Viewer for ${url}`}></iframe>
        </div>
    )
}

function ImageEmbed({ url }: { url: string }) {
    return (
        <div className="w-full flex justify-center bg-gray-100 p-2 rounded-lg">
            <img src={url} alt="Material de revisão" className="max-w-full h-auto rounded-md shadow-md" />
        </div>
    );
}

function ReviewPageContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams(); // 2. Pegar os search params
    const id = params.id as string;

    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        getActivityById(id)
            .then(data => {
                const materials = (data.reviewMaterials as any[] || []).map(m => {
                    const lowerUrl = m.url.toLowerCase();
                    let type: ReviewMaterial['type'] = 'link';
                    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) { type = 'youtube'; }
                    else if (lowerUrl.endsWith('.pdf')) { type = 'pdf'; }
                    else if (lowerUrl.endsWith('.png') || lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.gif') || lowerUrl.endsWith('.webp')) { type = 'image'; }
                    return { ...m, type };
                });
                setActivity({ ...data, reviewMaterials: materials });
            })
            .catch(err => console.error("Failed to load activity:", err))
            .finally(() => setLoading(false));
    }, [id]);

    const startQuiz = () => {
        const from = searchParams.get('from'); // 3. Ler o parâmetro 'from'
        const baseUrl = `/student/play/${id}`;
        const finalUrl = from ? `${baseUrl}?from=${from}` : baseUrl; // 4. Montar a URL final
        router.push(finalUrl);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!activity) {
        return <div className="text-center h-screen flex items-center justify-center">Atividade não encontrada.</div>;
    }

    return (
        <div className="container mx-auto max-w-4xl p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl font-bold text-center">Revisão para: {activity.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    <p className="text-center text-gray-600">Estude os materiais abaixo antes de começar o quiz.</p>
                    {activity.reviewMaterials && activity.reviewMaterials.length > 0 ? (
                        <div className="space-y-8">
                            {activity.reviewMaterials.map((material, index) => (
                                <div key={index}>
                                    {material.type === 'youtube' && <YouTubeEmbed url={material.url} />}
                                    {material.type === 'pdf' && <PDFEmbed url={material.url} />}
                                    {material.type === 'image' && <ImageEmbed url={material.url} />}
                                    {material.type === 'link' && (
                                        <a href={material.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                            <p className="font-semibold text-blue-600">Acessar Link Externo</p>
                                            <p className="text-sm text-gray-500 truncate">{material.url}</p>
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">Não há materiais de revisão para esta atividade.</p>
                    )}
                    <div className="text-center pt-6">
                        <Button onClick={startQuiz} size="lg" className="gap-2">
                            Estou Pronto! Começar o Quiz <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <ReviewPageContent />
        </Suspense>
    )
}
