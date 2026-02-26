"use client"

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Play, BookOpen, Trophy, Edit, AlertTriangle } from "lucide-react";

interface ActivityWithTeacher {
  id: string;
  title: string;
  description: string | null;
  type: string;
  difficulty: number;
  expiresAt?: string | null;
  reviewMaterials?: any;
  payload?: any;
  teacher?: { name: string } | null;
}

const cardStyles = `bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg transition-all`;

export default function ActivitiesSection({ activities, attemptsMap }: { activities: ActivityWithTeacher[]; attemptsMap: Map<string, number> }) {
    const [showExpired, setShowExpired] = useState(false);
    const filtered = showExpired ? activities : activities.filter(act => !(act.expiresAt && new Date(act.expiresAt) < new Date()));

    return (
        <section>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3"><Play className="text-orange-400" fill="currentColor" /> Missões Disponíveis</h2>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <Checkbox checked={showExpired} onCheckedChange={(c) => setShowExpired(!!c)} className="border-white/50" />
              <Label className="text-sm text-white/60">Mostrar expiradas</Label>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.length > 0 ? (
              filtered.map((activity) => {
                const bestScore = attemptsMap.get(activity.id);
                const hasReviewMaterials = activity.reviewMaterials && Array.isArray(activity.reviewMaterials) && activity.reviewMaterials.length > 0;
                const activityPath = hasReviewMaterials ? `/student/activity/${activity.id}/review` : `/student/play/${activity.id}`;
                const buttonText = hasReviewMaterials ? "Revisar e Jogar" : "Iniciar Missão";
                const ButtonIcon = hasReviewMaterials ? BookOpen : Play;
                const isExpired = activity.expiresAt && new Date(activity.expiresAt) < new Date();

                return (
                  <div key={activity.id} className={`${cardStyles} hover:border-blue-500/50 flex flex-col group`}>
                    <header className="p-6 pb-4">
                        <div className="flex justify-between items-start">
                           <div className="text-xs font-bold uppercase tracking-wider text-white/50">{activity.type}</div>
                            {bestScore !== undefined && (
                                <div className="font-semibold flex items-center gap-1 text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5 text-xs">
                                    <Trophy size={12} /> {bestScore}%
                                </div>
                            )}
                        </div>
                        <h3 className="text-lg mt-2 font-bold line-clamp-2 text-white">{activity.title}</h3>
                        {activity.teacher?.name && 
                            <div className="flex items-center gap-1.5 text-sm text-white/60 mt-1">
                                <Edit size={12}/> por {activity.teacher.name}
                            </div>
                        }
                    </header>
                    <div className="px-6 flex-grow">
                        <p className="text-sm text-white/60 line-clamp-2 h-10 flex-grow">{activity.description}</p>
                        {activity.expiresAt && (
                            <p className={`text-xs mt-1 ${isExpired ? 'text-red-400' : 'text-white/50'}`}>{isExpired ? 'Expirada' : `Expira em ${new Date(activity.expiresAt).toLocaleDateString()}`}</p>
                        )}
                        {((activity.payload as any)?.xpMaxReward > 0 || (activity.payload as any)?.goldReward > 0) && (
                            <div className="flex gap-3 mt-4 pt-3 border-t border-white/10">
                                {(activity.payload as any)?.xpMaxReward > 0 && (
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <span className="text-lg">🎯</span>
                                        <span className="text-white/70">XP: <span className="font-bold text-cyan-300">{(activity.payload as any).xpMaxReward}</span></span>
                                    </div>
                                )}
                                {(activity.payload as any)?.goldReward > 0 && (
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <span className="text-lg">💰</span>
                                        <span className="text-white/70">Ouro: <span className="font-bold text-yellow-300">{(activity.payload as any).goldReward}</span></span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <footer className="p-6 pt-4 mt-auto">
                      {isExpired ? (
                      <Button className="w-full gap-2 font-bold text-red-400 bg-white/10 opacity-60 cursor-not-allowed" disabled>
                          <AlertTriangle size={16} /> Expirada
                      </Button>
                    ) : (
                      <Link href={activityPath} className="w-full">
                        <Button className={`w-full gap-2 font-bold text-white transition-all ${hasReviewMaterials ? "bg-blue-600 hover:bg-blue-700" : "bg-white/10 group-hover:bg-white/20"}`}>
                          <ButtonIcon size={16} /> {buttonText}
                        </Button>
                      </Link>
                    )}
                    </footer>
                  </div>
                );
              })
            ) : (
                <div className={`col-span-full ${cardStyles} p-12 text-center text-white/60`}>
                    <p className="font-bold text-lg">Nenhuma missão disponível!</p>
                    <p className="text-sm mt-2">Parece que você está em dia. Fale com seu professor para mais atividades.</p>
                </div>
            )}
          </div>
        </section>
    );
}
