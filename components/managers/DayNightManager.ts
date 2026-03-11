// managers/DayNightManager.ts
import * as pc from 'playcanvas';

interface TimeKeyframe {
  time: number;
  sky: pc.Color;
  ambient: pc.Color;
  sun: pc.Color;
  intensity: number;
  pitch: number;
}

export class DayNightManager {
  private app: pc.Application;
  private cameraEntity: pc.Entity | null = null;
  private sunLight: pc.Entity | null = null;

  public timeOfDay: number = 12; // Inicia ao meio-dia por padrão
  public isPaused: boolean = false;

  public onTimeUpdate?: (time: number) => void;
  private lastEmittedTime = -1;

  // Keyframes mantidos: Cores vibrantes de dia e noites claras e azuladas
  private keyframes: TimeKeyframe[] = [
    { time: 0,  sky: new pc.Color(0.05, 0.05, 0.15), ambient: new pc.Color(0.3, 0.3, 0.4), sun: new pc.Color(0.1, 0.1, 0.2), intensity: 0.5, pitch: 90 }, 
    { time: 6,  sky: new pc.Color(0.80, 0.40, 0.20), ambient: new pc.Color(0.5, 0.4, 0.4), sun: new pc.Color(1.0, 0.6, 0.2), intensity: 0.8, pitch: 0 },  
    { time: 8,  sky: new pc.Color(0.40, 0.70, 1.00), ambient: new pc.Color(0.7, 0.7, 0.7), sun: new pc.Color(1.0, 0.9, 0.8), intensity: 1.2, pitch: -30 },  
    { time: 12, sky: new pc.Color(0.30, 0.60, 1.00), ambient: new pc.Color(0.9, 0.9, 0.9), sun: new pc.Color(1.0, 1.0, 1.0), intensity: 1.5, pitch: -90 },  
    { time: 16, sky: new pc.Color(0.40, 0.70, 1.00), ambient: new pc.Color(0.7, 0.7, 0.7), sun: new pc.Color(1.0, 0.9, 0.8), intensity: 1.2, pitch: -150 }, 
    { time: 18, sky: new pc.Color(0.80, 0.30, 0.10), ambient: new pc.Color(0.5, 0.4, 0.4), sun: new pc.Color(1.0, 0.4, 0.1), intensity: 0.8, pitch: -180 }, 
    { time: 20, sky: new pc.Color(0.05, 0.05, 0.15), ambient: new pc.Color(0.3, 0.3, 0.4), sun: new pc.Color(0.1, 0.1, 0.2), intensity: 0.5, pitch: -210 }, 
    { time: 24, sky: new pc.Color(0.05, 0.05, 0.15), ambient: new pc.Color(0.3, 0.3, 0.4), sun: new pc.Color(0.1, 0.1, 0.2), intensity: 0.5, pitch: -270 }  
  ];

  constructor(app: pc.Application) {
    this.app = app;
    // Removemos as funções de cache, pois agora usamos a hora real do sistema!
  }

  public setCamera(camera: pc.Entity): void {
    this.cameraEntity = camera;
  }

  private findSunLight(): void {
    if (this.sunLight) return; 
    const findLight = (entity: pc.Entity) => {
      if (entity.light && entity.light.type === 'directional') {
        this.sunLight = entity;
        return;
      }
      entity.children.forEach(child => findLight(child as pc.Entity));
    };
    findLight(this.app.root);
  }

  update(dt: number): void {
    this.findSunLight();

    // 👇 NOVA LÓGICA DE TEMPO 👇
    if (this.isPaused) {
      // Se pausado, crava o relógio sempre no meio-dia
      this.timeOfDay = 12;
    } else {
      // Se rodando, pega a hora exata do computador do usuário
      const now = new Date();
      // Converte a hora real para um número decimal (Ex: 14h30 vira 14.5)
      this.timeOfDay = now.getHours() + (now.getMinutes() / 60) + (now.getSeconds() / 3600);
    }

    this.updateLighting();

    // Avisa a interface apenas quando o minuto "visível" mudar (para não flodar o React de atualizações)
    const roundedTime = Math.floor(this.timeOfDay * 60); 
    if (roundedTime !== this.lastEmittedTime) {
        this.lastEmittedTime = roundedTime;
        if (this.onTimeUpdate) this.onTimeUpdate(this.timeOfDay);
    }
  }

  private updateLighting(): void {
    let frameA = this.keyframes[0];
    let frameB = this.keyframes[this.keyframes.length - 1];

    for (let i = 0; i < this.keyframes.length - 1; i++) {
      if (this.timeOfDay >= this.keyframes[i].time && this.timeOfDay < this.keyframes[i + 1].time) {
        frameA = this.keyframes[i];
        frameB = this.keyframes[i + 1];
        break;
      }
    }

    const t = (this.timeOfDay - frameA.time) / (frameB.time - frameA.time);
    const currentSky = new pc.Color().lerp(frameA.sky, frameB.sky, t);
    const currentAmbient = new pc.Color().lerp(frameA.ambient, frameB.ambient, t);
    const currentSun = new pc.Color().lerp(frameA.sun, frameB.sun, t);
    const currentIntensity = pc.math.lerp(frameA.intensity, frameB.intensity, t);
    const currentPitch = pc.math.lerp(frameA.pitch, frameB.pitch, t);

    if (this.cameraEntity && this.cameraEntity.camera) {
      this.cameraEntity.camera.clearColor = currentSky;
    }
    this.app.scene.ambientLight = currentAmbient;
    this.app.scene.skyboxIntensity = currentIntensity;

    if (this.sunLight && this.sunLight.light) {
      this.sunLight.light.color = currentSun;
      this.sunLight.light.intensity = currentIntensity;
      this.sunLight.setLocalEulerAngles(currentPitch, -45, 0); 
    }

    // --- CONTROLE DAS LUZES DA CIDADE ---
    let cityLightForce = 0;
    if (this.timeOfDay >= 18.5 || this.timeOfDay <= 5.5) {
      cityLightForce = 1.5; 
    } else if (this.timeOfDay > 18.0 && this.timeOfDay < 18.5) {
      cityLightForce = (this.timeOfDay - 18.0) * 2; 
    } else if (this.timeOfDay > 5.5 && this.timeOfDay < 6.0) {
      cityLightForce = (6.0 - this.timeOfDay) * 2;
    }

    const cityLights = this.app.root.findByTag('city-light') as pc.Entity[];
    cityLights.forEach(entity => {
      if (entity.light) entity.light.intensity = cityLightForce;
    });
  }
}