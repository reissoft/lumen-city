// app/config/buildings.ts
import { 
  Home, GraduationCap, Zap, Building2, TreeDeciduous, Shrub, Route, Landmark, Star
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
  "house": {
    "name": "Casa",
    "description": "Residência básica.",
    "category": "construction",
    "cost": 10,
    "url": "/models/house.glb",
    "icon": Home,
    "scale": 1
  },
  "school": {
    "name": "Escola",
    "description": "Ensino para jovens.",
    "category": "construction",
    "cost": 20,
    "url": "/models/school.glb",
    "icon": GraduationCap,
    "scale": 1.5
  },
  "power": {
    "name": "Usina",
    "description": "Gera energia.",
    "category": "construction",
    "cost": 50,
    "url": "/models/power.glb",
    "icon": Zap,
    "scale": 1
  },
  "apartment": {
    "name": "Prédio",
    "description": "Alta densidade.",
    "category": "construction",
    "cost": 20,
    "url": "/models/house.glb",
    "icon": Building2,
    "scale": 1.5
  },
  "park": {
    "name": "Árvore",
    "description": "Melhora o ar.",
    "category": "nature",
    "cost": 25,
    "url": "/models/park.glb",
    "icon": TreeDeciduous,
    "scale": 1.2
  },
  "bush": {
    "name": "Arbusto",
    "description": "Decoração simples.",
    "category": "nature",
    "cost": 10,
    "url": "/models/park.glb",
    "icon": Shrub,
    "scale": 0.8
  },
  "road": {
    "name": "Rua",
    "description": "Conecta prédios.",
    "category": "infrastructure",
    "cost": 5,
    "url": "/models/house.glb",
    "icon": Route,
    "scale": 0.1
  },
  "statue": {
    "name": "Estátua",
    "description": "Glória do líder.",
    "category": "special",
    "cost": 1000,
    "url": "/models/school.glb",
    "icon": Landmark,
    "scale": 0.8
  },
  "fountain": {
    "name": "Fonte",
    "description": "Água relaxante.",
    "category": "special",
    "cost": 800,
    "url": "/models/power.glb",
    "icon": Star,
    "scale": 0.8
  },
  "casa_2": {
    "name": "CASA 2",
    "description": "Resiodência básica",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-e.glb",
    "icon": Home,
    "scale": 1
  },
  "casa_3": {
    "name": "CASA 3",
    "description": "Resiodência básica",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-b.glb",
    "icon": Home,
    "scale": 1
  },
  "casa_4": {
    "name": "CASA 4",
    "description": "Resiodência básica",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-c.glb",
    "icon": Home,
    "scale": 1
  },
  "casa_5": {
    "name": "CASA 5",
    "description": "Residência básica.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-d.glb",
    "icon": Home,
    "scale": 1
  },
  "casa_6": {
    "name": "CASA 6",
    "description": "Residência básica.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-e.glb",
    "icon": Home,
    "scale": 1
  },
  "missao-jacobina": {
    "name": "MISSAO JACOBINA",
    "description": "Igreja da Missão de Jacobina",
    "category": "special",
    "cost": 0,
    "url": "/models/specials/missao.glb",
    "icon": Star,
    "scale": 5
  }
}

export type BuildingType = keyof typeof BUILDING_CONFIG;
