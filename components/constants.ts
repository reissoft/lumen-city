// constants.ts - Constantes e tipos compartilhados

export const MAP_SIZE = 100;
export const OFFSET = 48;
export const MIN_ZOOM = 5;
export const MAX_ZOOM = 50;
export const INITIAL_ZOOM = 20;
export const INITIAL_PITCH = 0;
export const INITIAL_YAW = 0;

// Configurações de câmera
export const CAMERA_CONFIG = {
  clearColor: { r: 0.15, g: 0.15, b: 0.2 },
  orthoHeight: 20,
  farClip: 1000,
  position: { x: 0, y: 45, z: 45 },
  lookAt: { x: 0, y: 0, z: 0 },
};

// Configurações de luz
export const LIGHT_CONFIG = {
  color: { r: 1, g: 0.95, b: 0.9 },
  intensity: 1.5,
  shadowDistance: 150,
  shadowResolution: 2048,
  eulerAngles: { x: 45, y: 135, z: 0 },
};

// Configurações de neblina
export const FOG_CONFIG = {
  color: { r: 0.06, g: 0.09, b: 0.16 },
  start: 50,
  end: 120,
};

// Configurações do chão
export const GROUND_CONFIG = {
  scale: { x: MAP_SIZE, y: 0.1, z: MAP_SIZE },
  position: { x: 0, y: -0.05, z: 0 },
  gridColor: '#334155',
  backgroundColor: '#0f172a',
  tileSize: 2,
  lineWidth: 4,
};

// Configurações do material fantasma
export const GHOST_MATERIAL_CONFIG = {
  validColor: { r: 0, g: 1, b: 0 },
  invalidColor: { r: 1, g: 0, b: 0 },
  opacity: 0.6,
  emissiveIntensity: 2,
  pulseSpeed: 0.005,
  pulseRange: 0.15,
  pulseBase: 0.55,
};

// Tipos
export interface Building {
  id: number;
  type: string;
  x: number;
  y: number;
  rotation?: number;
}

export interface CitySceneProps {
  buildings: Building[];
  onSelectTile?: (x: number, y: number) => void;
  onCancelBuild?: () => void;
  onAssetsLoaded?: () => void;
  activeBuild: string | null;
  selectedBuildingId: number | null;
}
