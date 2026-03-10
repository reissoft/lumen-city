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

  public timeOfDay: number = 8; 
  private readonly CYCLE_DURATION = 520; // 120 segundos para completar 24h

  public onTimeUpdate?: (time: number) => void;
  private lastEmittedTime = -1;

  // Keyframes do clima
 // Cores super claras: Dia radiante e Noite de "lua cheia" bastante visível
  private keyframes: TimeKeyframe[] = [
    // Madrugada
    { time: 0,  sky: new pc.Color(0.15, 0.20, 0.35), ambient: new pc.Color(0.4, 0.45, 0.6), sun: new pc.Color(0.4, 0.5, 0.7), intensity: 0.8, pitch: -30 }, 
    // Nascer do sol
    { time: 6,  sky: new pc.Color(0.80, 0.50, 0.30), ambient: new pc.Color(0.6, 0.50, 0.5), sun: new pc.Color(1.0, 0.8, 0.5), intensity: 1.2, pitch: -10 },  
    // Manhã
    { time: 8,  sky: new pc.Color(0.50, 0.80, 1.00), ambient: new pc.Color(0.8, 0.80, 0.8), sun: new pc.Color(1.0, 0.9, 0.9), intensity: 1.5, pitch: -45 },  
    // Meio-dia (Luz no máximo)
    { time: 12, sky: new pc.Color(0.40, 0.70, 1.00), ambient: new pc.Color(1.0, 1.00, 1.0), sun: new pc.Color(1.0, 1.0, 1.0), intensity: 2.0, pitch: -90 },  
    // Tarde
    { time: 16, sky: new pc.Color(0.50, 0.80, 1.00), ambient: new pc.Color(0.8, 0.80, 0.8), sun: new pc.Color(1.0, 0.9, 0.9), intensity: 1.5, pitch: -135 }, 
    // Pôr do sol
    { time: 18, sky: new pc.Color(0.80, 0.40, 0.20), ambient: new pc.Color(0.6, 0.50, 0.5), sun: new pc.Color(1.0, 0.6, 0.3), intensity: 1.2, pitch: -170 }, 
    // Início da noite
    { time: 20, sky: new pc.Color(0.15, 0.20, 0.35), ambient: new pc.Color(0.4, 0.45, 0.6), sun: new pc.Color(0.4, 0.5, 0.7), intensity: 0.8, pitch: -210 }, 
    // Meia-noite
    { time: 24, sky: new pc.Color(0.15, 0.20, 0.35), ambient: new pc.Color(0.4, 0.45, 0.6), sun: new pc.Color(0.4, 0.5, 0.7), intensity: 0.8, pitch: -330 }  
  ];

  constructor(app: pc.Application) {
    this.app = app;
  }

  public setCamera(camera: pc.Entity): void {
    this.cameraEntity = camera;
  }

  // 👇 CORRIGIDO COM A SUA DICA: Usa estritamente a string "directional"
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

    const hoursPerSecond = 24 / this.CYCLE_DURATION;
    this.timeOfDay += hoursPerSecond * dt;
    
    if (this.timeOfDay >= 24) {
      this.timeOfDay -= 24;
    }

    this.updateLighting();

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
    this.app.scene.skyboxIntensity = currentIntensity * 0.8;

    if (this.sunLight && this.sunLight.light) {
      this.sunLight.light.color = currentSun;
      this.sunLight.light.intensity = currentIntensity;
      this.sunLight.setLocalEulerAngles(currentPitch, -45, 0); 
    }
  }
}