import { useMemo } from 'react';
import { BUILDING_CONFIG, BuildingType } from '@/app/config/buildings';

// Interface do seu prédio local (x, y, type...)
interface LocalBuilding {
  type: string;
  // ... outros campos
}

export function useCityStats(buildings: LocalBuilding[], gameDay: number = 1) {
  const stats = useMemo(() => {
    let population = 0;
    let jobs = 0;
    let pollution = 0;
    let securityPoints = 0;
    let entertainment = 0;

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

    // --- NOVA MECÂNICA: META DE CRESCIMENTO ---
    // A cada 30 dias, a meta sobe 500. 
    // Ex: Dia 1 a 30 (Meta: 500). Dia 31 a 60 (Meta: 1000). Dia 61 a 90 (Meta: 1500).
    const expectedPopulation = Math.ceil(gameDay / 30) * 500;
    const populationDeficit = Math.max(0, expectedPopulation - population);

    // Desemprego
    const unemployed = Math.max(0, population - jobs);
    const unemploymentRate = population > 0 ? (unemployed / population) : 0;

    // Segurança
    const requiredSecurity = Math.ceil(population / 10); 
    let securityLevel = 100;
    if (population > 0) {
        securityLevel = Math.min(100, Math.max(0, 100 - (requiredSecurity - securityPoints) * 10));
    }

    // --- FELICIDADE ---
    let happiness = 100;

    // 1. PUNIÇÃO DE ESTAGNAÇÃO (Nova!):
    // Se a cidade não estiver crescendo, o povo fica impaciente.
    // Tira até 50 pontos de felicidade se a cidade estiver totalmente vazia perante a meta.
    if (populationDeficit > 0) {
        const growthPenalty = (populationDeficit / expectedPopulation) * 50;
        happiness -= growthPenalty;
    }

    // 2. SEGURANÇA:
    happiness -= (100 - securityLevel) * 1.2; 

    // 3. DESEMPREGO:
    happiness -= (unemploymentRate * 100) * 1.5; 

    // 4. POLUIÇÃO:
    happiness -= pollution * 2;

    // 5. ENTRETENIMENTO (Bônus):
    happiness += entertainment * 2;

    happiness = Math.min(100, Math.max(0, Math.round(happiness)));

    return {
      population,
      expectedPopulation, // Exportamos a meta para mostrar na tela!
      jobs,
      unemployed,
      happiness,
      securityLevel: Math.round(securityLevel),
      pollution
    };
  }, [buildings, gameDay]); // <-- O gameDay entrou como dependência aqui!

  return stats;
}