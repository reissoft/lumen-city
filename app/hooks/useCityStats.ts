import { useMemo } from 'react';
import { BUILDING_CONFIG, BuildingType } from '@/app/config/buildings';

// Interface do seu prédio local (x, y, type...)
interface LocalBuilding {
  type: string;
  // ... outros campos
}

export function useCityStats(buildings: LocalBuilding[]) {
  const stats = useMemo(() => {
    let population = 0;
    let jobs = 0;
    let pollution = 0;
    let securityPoints = 0;
    let entertainment = 0;

    // 1. Soma bruta dos atributos de todos os prédios
    buildings.forEach((b) => {
      const config = BUILDING_CONFIG[b.type as BuildingType];
      if (config && config.stats) {
        population += config.stats.population || 0;
        jobs += config.stats.jobs || 0;
        pollution += config.stats.pollution || 0;
        securityPoints += config.stats.security || 0;
        entertainment += config.stats.entertainment || 0;
      }
    });

    // 2. Cálculos Derivados (A Lógica do Jogo)
    
    // Desemprego: Se tem mais gente que emprego
    const unemployed = Math.max(0, population - jobs);
    const unemploymentRate = population > 0 ? (unemployed / population) : 0;

    // Segurança: Base 100, cai com a população, sobe com a polícia
    // (Exemplo: Cada 10 habitantes exigem 1 ponto de segurança)
    const requiredSecurity = Math.ceil(population / 10); 
    let securityLevel = 100;
    if (population > 0) {
        securityLevel = Math.min(100, Math.max(0, 50 + (securityPoints - requiredSecurity) * 5));
    }

    // Felicidade: A fórmula mágica
    // Começa em 100
    // - Desemprego pesa muito
    // - Poluição pesa médio
    // - Segurança baixa pesa médio
    // + Entretenimento ajuda
    let happiness = 100;
    happiness -= (unemploymentRate * 100) * 1.5; // Desemprego dói
    happiness -= pollution * 2;
    happiness += entertainment * 2;
    happiness -= (100 - securityLevel) * 0.5; // Insegurança

    // Trava entre 0 e 100
    happiness = Math.min(100, Math.max(0, Math.round(happiness)));

    return {
      population,
      jobs,
      unemployed,
      happiness,
      securityLevel: Math.round(securityLevel),
      pollution
    };
  }, [buildings]);

  return stats;
}