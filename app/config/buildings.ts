// app/config/buildings.ts
export type BuildingCategory = 'construction' | 'nature' | 'infrastructure' | 'special'

export interface BuildingDef {
  name: string
  description: string
  cost: number
  category: BuildingCategory
  url: string
  icon: any
  scale: number
  iconImage: string
  stats?: BuildingStats;
}

export interface BuildingStats {
  population?: number;      // Quantas pessoas moram (Casas)
  jobs?: number;            // Quantos empregos gera (Indústria/Comércio)
  pollution?: number;       // Impacto negativo (Indústria)
  security?: number;        // Impacto positivo (Polícia) ou negativo (Bares suspeitos?)
  entertainment?: number;   // Impacto na felicidade (Parques)
  
}

// Definição das Categorias (para usar na UI)
export const CATEGORIES: Record<BuildingCategory, string> = {
  construction: "Construção",
  nature: "Natureza",
  infrastructure: "Infraestrutura",
  special: "Especial"
}

export const BUILDING_CONFIG: Record<string, BuildingDef> = {
  "building_b": {
    "name": "Building B",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-b.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/building-b_icon.png",
    "stats": {
      population: 4,
      pollution: 1 // Gera um pouquinho de lixo
    }

  },
  "building_c": {
    "name": "Building C",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-c.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/building-c_icon.png"
  },
  "building_d": {
    "name": "Building D",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-d.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/building-d_icon.png"
  },
  "building_e": {
    "name": "Building E",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-e.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/building-e_icon.png"
  },
  "building_f": {
    "name": "Building F",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-f.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/building-f_icon.png"
  },
  "building_g": {
    "name": "Building G",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-g.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/building-g_icon.png"
  },
  "building_h": {
    "name": "Building H",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-h.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/building-h_icon.png"
  },
  "building_i": {
    "name": "Building I",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-i.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/building-i_icon.png"
  },
  "building_k": {
    "name": "Building K",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-k.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/building-k_icon.png"
  },
  "building_l": {
    "name": "Building L",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-l.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/building-l_icon.png"
  },
  "building_m": {
    "name": "Building M",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-m.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/building-m_icon.png"
  },
  "building_n": {
    "name": "Building N",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-n.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/building-n_icon.png"
  },
  "building_skyscraper_a": {
    "name": "Building Skyscraper A",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-skyscraper-a.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/building-skyscraper-a_icon.png"
  },
  "building_skyscraper_b": {
    "name": "Building Skyscraper B",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-skyscraper-b.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/building-skyscraper-b_icon.png"
  },
  "building_skyscraper_c": {
    "name": "Building Skyscraper C",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-skyscraper-c.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/building-skyscraper-c_icon.png"
  },
  "building_skyscraper_d": {
    "name": "Building Skyscraper D",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-skyscraper-d.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/building-skyscraper-d_icon.png"
  },
  "building_skyscraper_e": {
    "name": "Building Skyscraper E",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-skyscraper-e.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/building-skyscraper-e_icon.png"
  },
  "detail_awning_wide": {
    "name": "Detail Awning Wide",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/detail-awning-wide.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/detail-awning-wide_icon.png"
  },
  "detail_awning": {
    "name": "Detail Awning",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/detail-awning.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/detail-awning_icon.png"
  },
  "detail_overhang_wide": {
    "name": "Detail Overhang Wide",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/detail-overhang-wide.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/detail-overhang-wide_icon.png"
  },
  "detail_overhang": {
    "name": "Detail Overhang",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/detail-overhang.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/detail-overhang_icon.png"
  },
  "detail_parasol_a": {
    "name": "Detail Parasol A",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/detail-parasol-a.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/detail-parasol-a_icon.png"
  },
  "low_detail_building_a": {
    "name": "Low Detail Building A",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/low-detail-building-a.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/low-detail-building-a_icon.png"
  },
  "low_detail_building_b": {
    "name": "Low Detail Building B",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/low-detail-building-b.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/low-detail-building-b_icon.png"
  },
  "low_detail_building_c": {
    "name": "Low Detail Building C",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/low-detail-building-c.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/low-detail-building-c_icon.png"
  },
  "low_detail_building_e": {
    "name": "Low Detail Building E",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/low-detail-building-e.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/low-detail-building-e_icon.png"
  },
  "low_detail_building_f": {
    "name": "Low Detail Building F",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/low-detail-building-f.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/low-detail-building-f_icon.png"
  },
  "low_detail_building_g": {
    "name": "Low Detail Building G",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/low-detail-building-g.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/low-detail-building-g_icon.png"
  },
  "low_detail_building_h": {
    "name": "Low Detail Building H",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/low-detail-building-h.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/low-detail-building-h_icon.png"
  },
  "low_detail_building_i": {
    "name": "Low Detail Building I",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/low-detail-building-i.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/low-detail-building-i_icon.png"
  },
  "low_detail_building_j": {
    "name": "Low Detail Building J",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/low-detail-building-j.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/low-detail-building-j_icon.png"
  },
  "low_detail_building_k": {
    "name": "Low Detail Building K",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/low-detail-building-k.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/low-detail-building-k_icon.png"
  },
  "low_detail_building_l": {
    "name": "Low Detail Building L",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/low-detail-building-l.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/low-detail-building-l_icon.png"
  },
  "low_detail_building_m": {
    "name": "Low Detail Building M",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/low-detail-building-m.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/low-detail-building-m_icon.png"
  },
  "low_detail_building_n": {
    "name": "Low Detail Building N",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/low-detail-building-n.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/low-detail-building-n_icon.png"
  },
  "low_detail_building_wide_b": {
    "name": "Low Detail Building Wide B",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/low-detail-building-wide-b.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/low-detail-building-wide-b_icon.png"
  },
  "building_a": {
    "name": "Building A",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-a.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-a_icon.png"
  },
  "building_b_1": {
    "name": "Building B",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-b.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-b_icon.png"
  },
  "building_c_1": {
    "name": "Building C",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-c.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-c_icon.png"
  },
  "building_d_1": {
    "name": "Building D",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-d.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-d_icon.png"
  },
  "building_e_1": {
    "name": "Building E",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-e.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-e_icon.png"
  },
  "building_f_1": {
    "name": "Building F",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-f.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-f_icon.png"
  },
  "building_g_1": {
    "name": "Building G",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-g.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-g_icon.png"
  },
  "building_h_1": {
    "name": "Building H",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-h.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-h_icon.png"
  },
  "building_i_1": {
    "name": "Building I",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-i.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-i_icon.png"
  },
  "building_j": {
    "name": "Building J",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-j.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-j_icon.png"
  },
  "building_k_1": {
    "name": "Building K",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-k.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-k_icon.png"
  },
  "building_l_1": {
    "name": "Building L",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-l.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-l_icon.png"
  },
  "building_m_1": {
    "name": "Building M",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-m.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-m_icon.png"
  },
  "building_n_1": {
    "name": "Building N",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-n.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-n_icon.png"
  },
  "building_o": {
    "name": "Building O",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-o.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-o_icon.png"
  },
  "building_p": {
    "name": "Building P",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-p.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-p_icon.png"
  },
  "building_q": {
    "name": "Building Q",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-q.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-q_icon.png"
  },
  "building_r": {
    "name": "Building R",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-r.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-r_icon.png"
  },
  "building_s": {
    "name": "Building S",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-s.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-s_icon.png"
  },
  "building_t": {
    "name": "Building T",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-t.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/building-t_icon.png"
  },
  "chimney_basic": {
    "name": "Chimney Basic",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/chimney-basic.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/chimney-basic_icon.png"
  },
  "chimney_large": {
    "name": "Chimney Large",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/chimney-large.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/chimney-large_icon.png"
  },
  "chimney_medium": {
    "name": "Chimney Medium",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/chimney-medium.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/chimney-medium_icon.png"
  },
  "chimney_small": {
    "name": "Chimney Small",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/chimney-small.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/chimney-small_icon.png"
  },
  "detail_tank": {
    "name": "Detail Tank",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/detail-tank.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/detail-tank_icon.png"
  },
  "ambulance": {
    "name": "Ambulance",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/ambulance.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/ambulance_icon.png"
  },
  "box": {
    "name": "Box",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/box.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/box_icon.png"
  },
  "cone_flat": {
    "name": "Cone Flat",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/cone-flat.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/cone-flat_icon.png"
  },
  "cone": {
    "name": "Cone",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/cone.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/cone_icon.png"
  },
  "debris_bolt": {
    "name": "Debris Bolt",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/debris-bolt.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/debris-bolt_icon.png"
  },
  "debris_drivetrain": {
    "name": "Debris Drivetrain",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/debris-drivetrain.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/debris-drivetrain_icon.png"
  },
  "debris_spoiler_a": {
    "name": "Debris Spoiler A",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/debris-spoiler-a.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/debris-spoiler-a_icon.png"
  },
  "delivery_flat": {
    "name": "Delivery Flat",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/delivery-flat.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/delivery-flat_icon.png"
  },
  "delivery": {
    "name": "Delivery",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/delivery.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/delivery_icon.png"
  },
  "firetruck": {
    "name": "Firetruck",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/firetruck.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/firetruck_icon.png"
  },
  "garbage_truck": {
    "name": "Garbage Truck",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/garbage-truck.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/garbage-truck_icon.png"
  },
  "hatchback_sports": {
    "name": "Hatchback Sports",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/hatchback-sports.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/hatchback-sports_icon.png"
  },
  "kart_oobi": {
    "name": "Kart Oobi",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/kart-oobi.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/kart-oobi_icon.png"
  },
  "kart_oodi": {
    "name": "Kart Oodi",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/kart-oodi.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/kart-oodi_icon.png"
  },
  "kart_ooli": {
    "name": "Kart Ooli",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/kart-ooli.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/kart-ooli_icon.png"
  },
  "kart_oopi": {
    "name": "Kart Oopi",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/kart-oopi.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/kart-oopi_icon.png"
  },
  "kart_oozi": {
    "name": "Kart Oozi",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/kart-oozi.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/kart-oozi_icon.png"
  },
  "police": {
    "name": "Police",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/police.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/police_icon.png"
  },
  "race_future": {
    "name": "Race Future",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/race-future.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/race-future_icon.png"
  },
  "race": {
    "name": "Race",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/race.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/race_icon.png"
  },
  "sedan_sports": {
    "name": "Sedan Sports",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/sedan-sports.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/sedan-sports_icon.png"
  },
  "sedan": {
    "name": "Sedan",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/sedan.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/sedan_icon.png"
  },
  "suv_luxury": {
    "name": "Suv Luxury",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/suv-luxury.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/suv-luxury_icon.png"
  },
  "suv": {
    "name": "Suv",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/suv.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/suv_icon.png"
  },
  "taxi": {
    "name": "Taxi",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/taxi.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/taxi_icon.png"
  },
  "tractor_police": {
    "name": "Tractor Police",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/tractor-police.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/tractor-police_icon.png"
  },
  "tractor_shovel": {
    "name": "Tractor Shovel",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/tractor-shovel.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/tractor-shovel_icon.png"
  },
  "tractor": {
    "name": "Tractor",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/tractor.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/tractor_icon.png"
  },
  "truck_flat": {
    "name": "Truck Flat",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/truck-flat.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/truck-flat_icon.png"
  },
  "truck": {
    "name": "Truck",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/truck.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/truck_icon.png"
  },
  "van": {
    "name": "Van",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/cars/van.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/cars/van_icon.png"
  },
  "character_a": {
    "name": "Character A",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-a.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-a_icon.png"
  },
  "character_b": {
    "name": "Character B",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-b.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-b_icon.png"
  },
  "character_c": {
    "name": "Character C",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-c.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-c_icon.png"
  },
  "character_d": {
    "name": "Character D",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-d.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-d_icon.png"
  },
  "character_e": {
    "name": "Character E",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-e.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-e_icon.png"
  },
  "character_f": {
    "name": "Character F",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-f.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-f_icon.png"
  },
  "character_g": {
    "name": "Character G",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-g.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-g_icon.png"
  },
  "character_h": {
    "name": "Character H",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-h.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-h_icon.png"
  },
  "character_i": {
    "name": "Character I",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-i.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-i_icon.png"
  },
  "character_j": {
    "name": "Character J",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-j.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-j_icon.png"
  },
  "character_k": {
    "name": "Character K",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-k.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-k_icon.png"
  },
  "character_l": {
    "name": "Character L",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-l.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-l_icon.png"
  },
  "character_m": {
    "name": "Character M",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-m.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-m_icon.png"
  },
  "character_n": {
    "name": "Character N",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-n.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-n_icon.png"
  },
  "character_o": {
    "name": "Character O",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-o.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-o_icon.png"
  },
  "character_p": {
    "name": "Character P",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-p.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-p_icon.png"
  },
  "character_q": {
    "name": "Character Q",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-q.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-q_icon.png"
  },
  "character_r": {
    "name": "Character R",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/chars/character-r.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/chars/character-r_icon.png"
  },
  "construction_barrier": {
    "name": "Construction Barrier",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/construction-barrier.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/infra/construction-barrier_icon.png"
  },
  "construction_cone": {
    "name": "Construction Cone",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/construction-cone.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/construction-cone_icon.png"
  },
  "construction_light": {
    "name": "Construction Light",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/construction-light.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/construction-light_icon.png"
  },
  "light_curved_cross": {
    "name": "Light Curved Cross",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/light-curved-cross.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/light-curved-cross_icon.png"
  },
  "light_curved_double": {
    "name": "Light Curved Double",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/light-curved-double.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/light-curved-double_icon.png"
  },
  "light_curved": {
    "name": "Light Curved",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/light-curved.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/light-curved_icon.png"
  },
  "light_square_cross": {
    "name": "Light Square Cross",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/light-square-cross.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/light-square-cross_icon.png"
  },
  "light_square_double": {
    "name": "Light Square Double",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/light-square-double.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/light-square-double_icon.png"
  },
  "light_square": {
    "name": "Light Square",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/light-square.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/light-square_icon.png"
  },
  "road_bend_sidewalk": {
    "name": "Road Bend Sidewalk",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-bend-sidewalk.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-bend-sidewalk_icon.png"
  },
  "road_bend_square": {
    "name": "Road Bend Square",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-bend-square.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-bend-square_icon.png"
  },
  "road_bend": {
    "name": "Road Bend",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-bend.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-bend_icon.png"
  },
  "road_bridge": {
    "name": "Road Bridge",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-bridge.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-bridge_icon.png"
  },
  "road_crossing": {
    "name": "Road Crossing",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-crossing.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-crossing_icon.png"
  },
  "road_crossroad_line": {
    "name": "Road Crossroad Line",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-crossroad-line.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-crossroad-line_icon.png"
  },
  "road_crossroad_path": {
    "name": "Road Crossroad Path",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-crossroad-path.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-crossroad-path_icon.png"
  },
  "road_crossroad": {
    "name": "Road Crossroad",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-crossroad.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-crossroad_icon.png"
  },
  "road_curve_intersection": {
    "name": "Road Curve Intersection",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-curve-intersection.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-curve-intersection_icon.png"
  },
  "road_curve_pavement": {
    "name": "Road Curve Pavement",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-curve-pavement.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-curve-pavement_icon.png"
  },
  "road_curve": {
    "name": "Road Curve",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-curve.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-curve_icon.png"
  },
  "road_driveway_double": {
    "name": "Road Driveway Double",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-driveway-double.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-driveway-double_icon.png"
  },
  "road_driveway_single": {
    "name": "Road Driveway Single",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-driveway-single.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-driveway-single_icon.png"
  },
  "road_end_round": {
    "name": "Road End Round",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-end-round.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-end-round_icon.png"
  },
  "road_end": {
    "name": "Road End",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-end.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-end_icon.png"
  },
  "road_intersection_line": {
    "name": "Road Intersection Line",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-intersection-line.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-intersection-line_icon.png"
  },
  "road_intersection_path": {
    "name": "Road Intersection Path",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-intersection-path.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-intersection-path_icon.png"
  },
  "road_intersection": {
    "name": "Road Intersection",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-intersection.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-intersection_icon.png"
  },
  "road_roundabout": {
    "name": "Road Roundabout",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-roundabout.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-roundabout_icon.png"
  },
  "road_side_entry": {
    "name": "Road Side Entry",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-side-entry.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-side-entry_icon.png"
  },
  "road_side_exit": {
    "name": "Road Side Exit",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-side-exit.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-side-exit_icon.png"
  },
  "road_side": {
    "name": "Road Side",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-side.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-side_icon.png"
  },
  "road_slant_curve": {
    "name": "Road Slant Curve",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-slant-curve.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-slant-curve_icon.png"
  },
  "road_slant_flat_curve": {
    "name": "Road Slant Flat Curve",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-slant-flat-curve.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-slant-flat-curve_icon.png"
  },
  "road_slant_flat_high": {
    "name": "Road Slant Flat High",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-slant-flat-high.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-slant-flat-high_icon.png"
  },
  "road_slant_flat": {
    "name": "Road Slant Flat",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-slant-flat.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-slant-flat_icon.png"
  },
  "road_slant_high": {
    "name": "Road Slant High",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-slant-high.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-slant-high_icon.png"
  },
  "road_slant": {
    "name": "Road Slant",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-slant.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-slant_icon.png"
  },
  "road_split": {
    "name": "Road Split",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-split.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-split_icon.png"
  },
  "road_square": {
    "name": "Road Square",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-square.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-square_icon.png"
  },
  "road_straight_half": {
    "name": "Road Straight Half",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-straight-half.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-straight-half_icon.png"
  },
  "road_straight": {
    "name": "Road Straight",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/road-straight.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/road-straight_icon.png"
  },
  "sign_highway_detailed": {
    "name": "Sign Highway Detailed",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/sign-highway-detailed.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/sign-highway-detailed_icon.png"
  },
  "sign_highway_wide": {
    "name": "Sign Highway Wide",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/sign-highway-wide.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/sign-highway-wide_icon.png"
  },
  "sign_highway": {
    "name": "Sign Highway",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/sign-highway.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/sign-highway_icon.png"
  },
  "missao": {
    "name": "Missao",
    "description": "Descrição Placeholder.",
    "category": "special",
    "cost": 1000,
    "url": "/models/specials/missao.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/specials/missao_icon.png"
  },
  "building_type_a": {
    "name": "Building Type A",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-a.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-a_icon.png"
  },
  "building_type_b": {
    "name": "Building Type B",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-b.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-b_icon.png"
  },
  "building_type_c": {
    "name": "Building Type C",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-c.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-c_icon.png"
  },
  "building_type_d": {
    "name": "Building Type D",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-d.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-d_icon.png"
  },
  "building_type_e": {
    "name": "Building Type E",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-e.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-e_icon.png"
  },
  "building_type_f": {
    "name": "Building Type F",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-f.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-f_icon.png"
  },
  "building_type_g": {
    "name": "Building Type G",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-g.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-g_icon.png"
  },
  "building_type_h": {
    "name": "Building Type H",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-h.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-h_icon.png"
  },
  "building_type_i": {
    "name": "Building Type I",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-i.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-i_icon.png"
  },
  "building_type_j": {
    "name": "Building Type J",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-j.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-j_icon.png"
  },
  "building_type_k": {
    "name": "Building Type K",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-k.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-k_icon.png"
  },
  "building_type_l": {
    "name": "Building Type L",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-l.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-l_icon.png"
  },
  "building_type_m": {
    "name": "Building Type M",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-m.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-m_icon.png"
  },
  "building_type_n": {
    "name": "Building Type N",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-n.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-n_icon.png"
  },
  "building_type_o": {
    "name": "Building Type O",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-o.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-o_icon.png"
  },
  "building_type_p": {
    "name": "Building Type P",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-p.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-p_icon.png"
  },
  "building_type_q": {
    "name": "Building Type Q",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-q.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-q_icon.png"
  },
  "building_type_r": {
    "name": "Building Type R",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-r.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-r_icon.png"
  },
  "building_type_s": {
    "name": "Building Type S",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-s.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-s_icon.png"
  },
  "building_type_t": {
    "name": "Building Type T",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-t.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-t_icon.png"
  },
  "building_type_u": {
    "name": "Building Type U",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-u.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/building-type-u_icon.png"
  },
  "driveway_long": {
    "name": "Driveway Long",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/driveway-long.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/driveway-long_icon.png"
  },
  "driveway_short": {
    "name": "Driveway Short",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/driveway-short.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/driveway-short_icon.png"
  },
  "fence_1x2": {
    "name": "Fence 1X2",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/fence-1x2.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/fence-1x2_icon.png"
  },
  "fence_1x3": {
    "name": "Fence 1X3",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/fence-1x3.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/fence-1x3_icon.png"
  },
  "fence_1x4": {
    "name": "Fence 1X4",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/fence-1x4.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/fence-1x4_icon.png"
  },
  "fence_2x2": {
    "name": "Fence 2X2",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/fence-2x2.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/fence-2x2_icon.png"
  },
  "fence_2x3": {
    "name": "Fence 2X3",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/fence-2x3.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/fence-2x3_icon.png"
  },
  "fence_3x2": {
    "name": "Fence 3X2",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/fence-3x2.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/fence-3x2_icon.png"
  },
  "fence_3x3": {
    "name": "Fence 3X3",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/fence-3x3.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/fence-3x3_icon.png"
  },
  "fence_low": {
    "name": "Fence Low",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/fence-low.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/fence-low_icon.png"
  },
  "fence": {
    "name": "Fence",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/fence.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/fence_icon.png"
  },
  "path_long": {
    "name": "Path Long",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/path-long.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/path-long_icon.png"
  },
  "path_short": {
    "name": "Path Short",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/path-short.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/path-short_icon.png"
  },
  "planter": {
    "name": "Planter",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/planter.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/planter_icon.png"
  },
  "tree_large": {
    "name": "Tree Large",
    "description": "Descrição Placeholder.",
    "category": "nature",
    "cost": 25,
    "url": "/models/suburban/tree-large.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/suburban/tree-large_icon.png"
  },
  "tree_small": {
    "name": "Tree Small",
    "description": "Descrição Placeholder.",
    "category": "nature",
    "cost": 25,
    "url": "/models/suburban/tree-small.glb",
    "icon": "__ICON_TreeDeciduous__",
    "scale": 2,
    "iconImage": "/models/suburban/tree-small_icon.png"
  }
}

export type BuildingType = keyof typeof BUILDING_CONFIG;
