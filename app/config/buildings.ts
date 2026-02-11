// config/buildings.ts
import { Home, TreeDeciduous, GraduationCap, Zap } from "lucide-react"

export const BUILDING_CONFIG = {
  house: {
    name: "Casa",
    cost: 50,
    url: "/models/house.glb",
    icon: Home,
    color: { r: 0.2, g: 0.6, b: 1 }, // Cor para o cursor/fallback
    scale: 1.0
  },
  park: {
    name: "Parque",
    cost: 100,
    url: "/models/park.glb",
    icon: TreeDeciduous,
    color: { r: 0.2, g: 0.8, b: 0.2 },
    scale: 1.2
  },
  school: {
    name: "Escola",
    cost: 150,
    url: "/models/school.glb",
    icon: GraduationCap,
    color: { r: 1, g: 0.3, b: 0.3 },
    scale: 1.5
  },
  power: {
    name: "Energia",
    cost: 300,
    url: "/models/power.glb",
    icon: Zap,
    color: { r: 1, g: 0.8, b: 0 },
    scale: 1.0
  },
  academia: {
    name: "Academia",
    cost: 300,
    url: "/models/academia.glb",
    icon: Zap,
    color: { r: 1, g: 0.8, b: 0 },
    scale: 3
  }
}

export type BuildingType = keyof typeof BUILDING_CONFIG