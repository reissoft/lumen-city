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
  stats?: BuildingStats,
  yOffset?: number; 
  haveLight?: boolean; // Indica se o prédio tem luzes (para ligar/desligar à noite)
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
    "name": "Casa",
    "description": "Uma simples casa.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-b.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 4,
      "pollution": 1
    },
    "iconImage": "/models/building-b_icon.png",
    haveLight: true,
  },
  "building_c": {
    "name": "Casa",
    "description": "Uma simples casa.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-c.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 4,
      "pollution": 1
    },
    "iconImage": "/models/building-c_icon.png",
    haveLight: true,
  },
  "building_d": {
    "name": "Casa",
    "description": "Uma simples casa.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-d.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 4,
      "pollution": 1
    },
    "iconImage": "/models/building-d_icon.png",
    haveLight: true,
  },
  "building_e": {
    "name": "Casa",
    "description": "Uma simples casa média.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-e.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 5,
      "pollution": 1
    },
    "iconImage": "/models/building-e_icon.png",
    haveLight: true,
  },
  "building_f": {
    "name": "Casa",
    "description": "Uma simples casa alta.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-f.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 6,
      "pollution": 1
    },
    "iconImage": "/models/building-f_icon.png",
    haveLight: true,
  },
  "building_g": {
    "name": "Casa",
    "description": "Uma simples casa.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-g.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 6,
      "pollution": 1
    },
    "iconImage": "/models/building-g_icon.png",
    haveLight: true,
  },
  "building_h": {
    "name": "Casa",
    "description": "Uma simples casa.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-h.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 6,
      "pollution": 1
    },
    "iconImage": "/models/building-h_icon.png",
    haveLight: true,
  },
  "building_i": {
    "name": "Casa",
    "description": "Uma simples casa grande.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-i.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 9,
      "pollution": 2
    },
    "iconImage": "/models/building-i_icon.png",
    haveLight: true,
  },
  "building_k": {
    "name": "Casa",
    "description": "Uma simples casa grande.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-k.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 10,
      "pollution": 2
    },
    "iconImage": "/models/building-k_icon.png",
    haveLight: true,
  },
  "building_l": {
    "name": "Casa",
    "description": "Uma simples casa grande.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-l.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 12,
      "pollution": 3
    },
    "iconImage": "/models/building-l_icon.png",
    haveLight: true,
  },
  "building_m": {
    "name": "Casa",
    "description": "Uma simples casa grande.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-m.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 12,
      "pollution": 3
    },
    "iconImage": "/models/building-m_icon.png",
    haveLight: true,
  },
  "building_n": {
    "name": "Hospital",
    "description": "Uma simples Hospital.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-n.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 8,
      "pollution": 4,
      "security": 2
    },
    "iconImage": "/models/building-n_icon.png",
    haveLight: true,
  },
  "building_skyscraper_a": {
    "name": "Edifício",
    "description": "Um prédio para trabalho.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-skyscraper-a.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 10,
      "pollution": 5
    },
    "iconImage": "/models/building-skyscraper-a_icon.png",
    haveLight: true,
  },
  "building_skyscraper_b": {
    "name": "Edifício",
    "description": "Um prédio para trabalho.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-skyscraper-b.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 14,
      "pollution": 7
    },
    "iconImage": "/models/building-skyscraper-b_icon.png",
    haveLight: true,
  },
  "building_skyscraper_c": {
    "name": "Edifício",
    "description": "Um prédio para trabalho.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-skyscraper-c.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 12,
      "pollution": 6
    },
    "iconImage": "/models/building-skyscraper-c_icon.png",
    haveLight: true,
  },
  "building_skyscraper_d": {
    "name": "Edifício",
    "description": "Um prédio para trabalho.",
    "category": "construction",
    "cost": 10,
    "url": "/models/building-skyscraper-d.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 16,
      "pollution": 8
    },
    "iconImage": "/models/building-skyscraper-d_icon.png",
    haveLight: true,
  },
  "building_skyscraper_e": {
    "name": "Edifício",
    "description": "Um prédio para trabalho.",
    "category": "construction",
    "cost": 100,
    "url": "/models/building-skyscraper-e.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 10,
      "pollution": 5
    },
    "iconImage": "/models/building-skyscraper-e_icon.png",
    haveLight: true,
  },
  "detail_parasol_a": {
    "name": "Detalhe Parasol",
    "description": "Um detalhe para deixar a cidade mais bonita.",
    "category": "construction",
    "cost": 100,
    "url": "/models/detail-parasol-a.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/detail-parasol-a_icon.png",
    haveLight: true,
  },
  "low_detail_building_a": {
    "name": "Edifício Moderno",
    "description": "Um edifício moderno para a cidade.",
    "category": "construction",
    "cost": 100,
    "url": "/models/low-detail-building-a.glb",
    "icon": "__ICON_Home__",
    "scale": 4,
    "iconImage": "/models/low-detail-building-a_icon.png",
    "stats": {
      "population": 60,
      "pollution": 30
    },
    haveLight: true,
  },
  "low_detail_building_b": {
    "name": "Edifício Moderno B",
    "description": "Um edifício moderno para a cidade.",
    "category": "construction",
    "cost": 100,
    "url": "/models/low-detail-building-b.glb",
    "icon": "__ICON_Home__",
    "scale": 4,
    "iconImage": "/models/low-detail-building-b_icon.png",
    "stats": {
      "population": 60,
      "pollution": 30
    },
    haveLight: true,
  },
  "low_detail_building_c": {
    "name": "Edifício Moderno C",
    "description": "Um edifício moderno para a cidade.",
    "category": "construction",
    "cost": 100,
    "url": "/models/low-detail-building-c.glb",
    "icon": "__ICON_Home__",
    "scale": 4,
    "iconImage": "/models/low-detail-building-c_icon.png",
    "stats": {
      "population": 60,
      "pollution": 30
    },
    haveLight: true,
  },
  "low_detail_building_e": {
    "name": "Edifício Moderno E",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 100,
    "url": "/models/low-detail-building-e.glb",
    "icon": "__ICON_Home__",
    "scale": 4,
    "iconImage": "/models/low-detail-building-e_icon.png",
    "stats": {
      "population": 60,
      "pollution": 30
    },
    haveLight: true,
  },
  "low_detail_building_f": {
    "name": "Edifício Moderno F",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 100,
    "url": "/models/low-detail-building-f.glb",
    "icon": "__ICON_Home__",
    "scale": 4,
    "iconImage": "/models/low-detail-building-f_icon.png",
    "stats": {
      "population": 60,
      "pollution": 30
    },
    haveLight: true,
  },
  "low_detail_building_g": {
    "name": "Edifício Moderno G",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 100,
    "url": "/models/low-detail-building-g.glb",
    "icon": "__ICON_Home__",
    "scale": 4,
    "iconImage": "/models/low-detail-building-g_icon.png",
    "stats": {
      "population": 60,
      "pollution": 30
    },

    haveLight: true,
  },
  "low_detail_building_h": {
    "name": "Edifício Moderno H",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 100,
    "url": "/models/low-detail-building-h.glb",
    "icon": "__ICON_Home__",
    "scale": 4,
    "iconImage": "/models/low-detail-building-h_icon.png",
    "stats": {
      "population": 60,
      "pollution": 30
    },
    haveLight: true,
  },
  "low_detail_building_i": {
    "name": "Edifício Moderno I",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 100,
    "url": "/models/low-detail-building-i.glb",
    "icon": "__ICON_Home__",
    "scale": 4,
    "iconImage": "/models/low-detail-building-i_icon.png",
    "stats": {
      "population": 60,
      "pollution": 30
    },
    haveLight: true,
  },
  "low_detail_building_j": {
    "name": "Edifício Moderno J",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 100,
    "url": "/models/low-detail-building-j.glb",
    "icon": "__ICON_Home__",
    "scale": 4,
    "iconImage": "/models/low-detail-building-j_icon.png",
    "stats": {
      "population": 60,
      "pollution": 30
    },
    haveLight: true,
  },
  "low_detail_building_k": {
    "name": "Edifício Moderno K",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 100,
    "url": "/models/low-detail-building-k.glb",
    "icon": "__ICON_Home__",
    "scale": 4,
    "iconImage": "/models/low-detail-building-k_icon.png",
    "stats": {
      "population": 60,
      "pollution": 30
    },
    haveLight: true,
  },
  "low_detail_building_l": {
    "name": "Edifício Moderno L",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 100,
    "url": "/models/low-detail-building-l.glb",
    "icon": "__ICON_Home__",
    "scale": 4,
    "iconImage": "/models/low-detail-building-l_icon.png",
    "stats": {
      "population": 60,
      "pollution": 30
    },
    haveLight: true,
  },
  "low_detail_building_m": {
    "name": "Edifício Moderno M",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 100,
    "url": "/models/low-detail-building-m.glb",
    "icon": "__ICON_Home__",
    "scale": 4,
    "iconImage": "/models/low-detail-building-m_icon.png",
    "stats": {
      "population": 60,
      "pollution": 30
    },
    haveLight: true,
  },
  "low_detail_building_n": {
    "name": "Edifício Moderno N",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 100,
    "url": "/models/low-detail-building-n.glb",
    "icon": "__ICON_Home__",
    "scale": 4,
    "iconImage": "/models/low-detail-building-n_icon.png",
    "stats": {
      "population": 60,
      "pollution": 30
    },
    haveLight: true,
  },
  "low_detail_building_wide_b": {
    "name": "Edifício Moderno Baix B",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 100,
    "url": "/models/low-detail-building-wide-b.glb",
    "icon": "__ICON_Home__",
    "scale": 4,
    "iconImage": "/models/low-detail-building-wide-b_icon.png",
    "stats": {
      "population": 60,
      "pollution": 30
    },
    haveLight: true,
  },
  "building_a": {
    "name": "Indústria",
    "description": "Uma indústria para trabalho.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-a.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 6,
      "pollution": 3
    },
    "iconImage": "/models/buildings/building-a_icon.png",
    haveLight: true,
  },
  "building_b_1": {
    "name": "Indústria",
    "description": "Uma indústria para trabalho.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-b.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 6,
      "pollution": 3
    },
    "iconImage": "/models/buildings/building-b_icon.png",
    haveLight: true,
  },
  "building_c_1": {
    "name": "Fábrica",
    "description": "Uma fábrica para trabalho.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-c.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 10,
      "pollution": 5
    },
    "iconImage": "/models/buildings/building-c_icon.png",
    haveLight: true,
  },
  "building_d_1": {
    "name": "Indústria",
    "description": "Uma indústria para trabalho.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-d.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 8,
      "pollution": 4
    },
    "iconImage": "/models/buildings/building-d_icon.png",
    haveLight: true,
  },
  "building_e_1": {
    "name": "Fábrica",
    "description": "Uma fábrica para trabalho.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-e.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 6,
      "pollution": 3
    },
    haveLight: true,
    "iconImage": "/models/buildings/building-e_icon.png"
  },
  "building_f_1": {
    "name": "Fábrica",
    "description": "Uma fábrica para trabalho.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-f.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 6,
      "pollution": 3
    },
    "iconImage": "/models/buildings/building-f_icon.png",
    haveLight: true,
  },
  "building_g_1": {
    "name": "Indústria",
    "description": "Uma indústria para trabalho.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-g.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 8,
      "pollution": 4
    },
    "iconImage": "/models/buildings/building-g_icon.png",
    haveLight: true,
  },
  "building_h_1": {
    "name": "Casa",
    "description": "Uma simples casa pequena.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-h.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 2,
      "pollution": 1
    },
    "iconImage": "/models/buildings/building-h_icon.png",
    haveLight: true,
  },
  "building_i_1": {
    "name": "Casa",
    "description": "Uma simples casa pequena.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-i.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 2,
      "pollution": 1
    },
    "iconImage": "/models/buildings/building-i_icon.png",
    haveLight: true,
  },
  "building_j": {
    "name": "Armazém",
    "description": "Um simples armazém.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-j.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 2,
      "pollution": 1
    },
    "iconImage": "/models/buildings/building-j_icon.png",
    haveLight: true,
  },
  "building_k_1": {
    "name": "Armazém",
    "description": "Um simples armazém.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-k.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 2,
      "pollution": 1
    },
    "iconImage": "/models/buildings/building-k_icon.png",
    haveLight: true,
  },
  "building_l_1": {
    "name": "Fábrica",
    "description": "Uma fábrica para trabalho.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-l.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 6,
      "pollution": 3
    },
    "iconImage": "/models/buildings/building-l_icon.png",
    haveLight: true,
  },
  "building_m_1": {
    "name": "Fábrica",
    "description": "Uma fábrica para trabalho.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-m.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 8,
      "pollution": 4
    },
    "iconImage": "/models/buildings/building-m_icon.png",
    haveLight: true,
  },
  "building_n_1": {
    "name": "Fábrica",
    "description": "Uma fábrica para trabalho.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-n.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 6,
      "pollution": 3
    },
    "iconImage": "/models/buildings/building-n_icon.png",
    haveLight: true,
  },
  "building_o": {
    "name": "Indústria",
    "description": "Uma indústria para trabalho.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-o.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 4,
      "pollution": 2
    },
    "iconImage": "/models/buildings/building-o_icon.png",
    haveLight: true,
  },
  "building_p": {
    "name": "Casa",
    "description": "Uma simples casinha.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-p.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 2,
      "pollution": 1
    },
    "iconImage": "/models/buildings/building-p_icon.png",
    haveLight: true,
  },
  "building_q": {
    "name": "Polícia",
    "description": "Um simples porto de polícia.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-q.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 6,
      "pollution": 3,
      "security": 3
    },
    "iconImage": "/models/buildings/building-q_icon.png",
    haveLight: true,
  },
  "building_r": {
    "name": "Polícia",
    "description": "Um simples porto de polícia.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-r.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 4,
      "pollution": 2,
      "security": 2
    },
    "iconImage": "/models/buildings/building-r_icon.png",
    haveLight: true,
  },
  "building_s": {
    "name": "Armazém",
    "description": "Um simples armazém.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-s.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "jobs": 4,
      "pollution": 2
    },
    "iconImage": "/models/buildings/building-s_icon.png",
    haveLight: true,
  },
  "building_t": {
    "name": "Casa",
    "description": "Uma simples casa.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/building-t.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 6,
      "pollution": 1
    },
    "iconImage": "/models/buildings/building-t_icon.png",
    haveLight: true,
  },
  "chimney_basic": {
    "name": "Chimney Basic",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/chimney-basic.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/chimney-basic_icon.png",
    haveLight: true,
  },
  "chimney_large": {
    "name": "Chimney Large",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/chimney-large.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/chimney-large_icon.png",
    haveLight: true,
  },
  "chimney_medium": {
    "name": "Chimney Medium",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/chimney-medium.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/chimney-medium_icon.png",
    haveLight: true,
  },
  "chimney_small": {
    "name": "Chimney Small",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/chimney-small.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/chimney-small_icon.png",
    haveLight: true,
  },
  "detail_tank": {
    "name": "Detail Tank",
    "description": "Descrição Placeholder.",
    "category": "construction",
    "cost": 10,
    "url": "/models/buildings/detail-tank.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "iconImage": "/models/buildings/detail-tank_icon.png",
    haveLight: true,
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
    "iconImage": "/models/infra/construction-light_icon.png",
    haveLight: true,
  },
  "light_curved_cross": {
    "name": "Light Curved Cross",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/light-curved-cross.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/light-curved-cross_icon.png",
    haveLight: true,
  },
  "light_curved_double": {
    "name": "Light Curved Double",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/light-curved-double.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/light-curved-double_icon.png",
    haveLight: true,
  },
  "light_curved": {
    "name": "Light Curved",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/light-curved.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/light-curved_icon.png",
    haveLight: true,
  },
  "light_square_cross": {
    "name": "Light Square Cross",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/light-square-cross.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/light-square-cross_icon.png",
    haveLight: true,
  },
  "light_square_double": {
    "name": "Light Square Double",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/light-square-double.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/light-square-double_icon.png",
    haveLight: true,
  },
  "light_square": {
    "name": "Light Square",
    "description": "Descrição Placeholder.",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/light-square.glb",
    "icon": "__ICON_Route__",
    "scale": 2,
    "iconImage": "/models/infra/light-square_icon.png",
    haveLight: true,
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
    "description": "Uma igreja.",
    "category": "special",
    "cost": 1000,
    "url": "/models/specials/missao.glb",
    "icon": "__ICON_Home__",
    "scale": 3,
    "stats": {
      "pollution": 1,
      "entertainment": 3
    },
    "iconImage": "/models/specials/missao_icon.png",
    yOffset: 0.5
  },
  "building_type_a": {
    "name": "Casa",
    "description": "Uma simples casa.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-a.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 5,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-a_icon.png"
  },
  "building_type_b": {
    "name": "Casa",
    "description": "Uma simples casa.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-b.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 5,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-b_icon.png"
  },
  "building_type_c": {
    "name": "Casa",
    "description": "Uma simples casa média.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-c.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 6,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-c_icon.png"
  },
  "building_type_d": {
    "name": "Casa",
    "description": "Uma simples casa média.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-d.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 6,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-d_icon.png"
  },
  "building_type_e": {
    "name": "Casa",
    "description": "Uma simples casa média.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-e.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 6,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-e_icon.png"
  },
  "building_type_f": {
    "name": "Casa",
    "description": "Uma simples casa grande.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-f.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 8,
      "pollution": 2
    },
    "iconImage": "/models/suburban/building-type-f_icon.png"
  },
  "building_type_g": {
    "name": "Casa",
    "description": "Uma simples casa pequena.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-g.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 2,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-g_icon.png"
  },
  "building_type_h": {
    "name": "Casa",
    "description": "Uma simples casa pequena.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-h.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 3,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-h_icon.png"
  },
  "building_type_i": {
    "name": "Casa",
    "description": "Uma simples casa pequena.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-i.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 3,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-i_icon.png"
  },
  "building_type_j": {
    "name": "Casa",
    "description": "Uma simples casa.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-j.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 4,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-j_icon.png"
  },
  "building_type_k": {
    "name": "Casa",
    "description": "Uma simples casa.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-k.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 4,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-k_icon.png"
  },
  "building_type_l": {
    "name": "Casa",
    "description": "Uma simples casa.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-l.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 4,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-l_icon.png"
  },
  "building_type_m": {
    "name": "Casa",
    "description": "Uma simples casa média.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-m.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 5,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-m_icon.png"
  },
  "building_type_n": {
    "name": "Casa",
    "description": "Uma simples casa média.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-n.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 6,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-n_icon.png"
  },
  "building_type_o": {
    "name": "Casa",
    "description": "Uma simples casa média.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-o.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 6,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-o_icon.png"
  },
  "building_type_p": {
    "name": "Casa",
    "description": "Uma simples casa média.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-p.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 6,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-p_icon.png"
  },
  "building_type_q": {
    "name": "Casa",
    "description": "Uma simples casa média.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-q.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 7,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-q_icon.png"
  },
  "building_type_r": {
    "name": "Casa",
    "description": "Uma simples casa média.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-r.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 6,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-r_icon.png"
  },
  "building_type_s": {
    "name": "Casa",
    "description": "Uma simples casa média.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-s.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 6,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-s_icon.png"
  },
  "building_type_t": {
    "name": "Casa",
    "description": "Uma simples casa grande.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-t.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 8,
      "pollution": 1
    },
    "iconImage": "/models/suburban/building-type-t_icon.png"
  },
  "building_type_u": {
    "name": "Building Type U",
    "description": "Uma simples casa média.",
    "category": "construction",
    "cost": 10,
    "url": "/models/suburban/building-type-u.glb",
    "icon": "__ICON_Home__",
    "scale": 2,
    "stats": {
      "population": 6,
      "pollution": 1
    },
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
    "scale": 1.5,
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
  },
  "rail_trilho": {
    "name": "Trilho",
    "description": "Trilho de trem",
    "category": "infrastructure",
    "cost": 1,
    "url": "/models/infra/train/railroad-straight.glb",
    "icon": "__ICON_TreeDeciduous__",
    "scale": 0.5,
    "stats": {
      "entertainment": 1
    },
    "iconImage": "/models/infra/train/railroad-straight_icon.png"
  },
  "airport": {
    "name": "Aeroporto",
    "description": "Aeroporto",
    "category": "special",
    "cost": 100,
    "url": "/models/specials/airport_tower.glb",
    "icon": "__ICON_Home__",
    "scale": 4,
    "stats": {
      "entertainment": 10
    },
    "iconImage": "/models/specials/airport_tower_icon.png",
    "yOffset": 1.5,
    haveLight: true,
  }
}

export type BuildingType = keyof typeof BUILDING_CONFIG;
