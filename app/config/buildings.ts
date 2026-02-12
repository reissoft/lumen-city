// app/config/buildings.ts
import { 
  Home, TreeDeciduous, GraduationCap, Zap, 
  Building2, Shrub, Route, Star, Landmark 
} from "lucide-react"

export type BuildingCategory = 'construction' | 'nature' | 'infrastructure' | 'special'

export interface BuildingDef {
  name: string
  description: string
  cost: number
  category: BuildingCategory
  url: string
  icon: any
  scale: number
}

// Definição das Categorias (para usar na UI)
export const CATEGORIES: Record<BuildingCategory, string> = {
  construction: "Construção",
  nature: "Natureza",
  infrastructure: "Infraestrutura",
  special: "Especial"
}

export const BUILDING_CONFIG: Record<string, BuildingDef> = {
  // --- CONSTRUÇÃO ---
  house: {
    name: "Casa",
    description: "Residência básica.",
    category: 'construction',
    cost: 50,
    url: "/models/house.glb",
    icon: Home,
    scale: 1.0
  },
  school: {
    name: "Escola",
    description: "Ensino para jovens.",
    category: 'construction',
    cost: 150,
    url: "/models/school.glb",
    icon: GraduationCap,
    scale: 1.5
  },
  power: {
    name: "Usina",
    description: "Gera energia.",
    category: 'construction',
    cost: 300,
    url: "/models/power.glb",
    icon: Zap,
    scale: 1.0
  },
  apartment: {
    name: "Prédio",
    description: "Alta densidade.",
    category: 'construction',
    cost: 500,
    url: "/models/house.glb", // Usei placeholder, troque depois
    icon: Building2,
    scale: 1.5
  },

  // --- NATUREZA ---
  park: {
    name: "Árvore",
    description: "Melhora o ar.",
    category: 'nature',
    cost: 25,
    url: "/models/park.glb",
    icon: TreeDeciduous,
    scale: 1.2
  },
  bush: {
    name: "Arbusto",
    description: "Decoração simples.",
    category: 'nature',
    cost: 10,
    url: "/models/park.glb", // Placeholder
    icon: Shrub,
    scale: 0.8
  },

  // --- INFRAESTRUTURA ---
  road: {
    name: "Rua",
    description: "Conecta prédios.",
    category: 'infrastructure',
    cost: 5,
    url: "/models/house.glb", // Placeholder (ideal seria um modelo plano)
    icon: Route,
    scale: 0.1 // Bem baixo para parecer chão
  },

  // --- ESPECIAL ---
  statue: {
    name: "Estátua",
    description: "Glória do líder.",
    category: 'special',
    cost: 1000,
    url: "/models/school.glb", // Placeholder
    icon: Landmark,
    scale: 0.8
  },
  fountain: {
    name: "Fonte",
    description: "Água relaxante.",
    category: 'special',
    cost: 800,
    url: "/models/power.glb", // Placeholder
    icon: Star,
    scale: 0.8
  }
}

export type BuildingType = keyof typeof BUILDING_CONFIG;