// managers/CloudManager.ts - Cria nuvens procedurais e gerencia a chuva
import * as pc from 'playcanvas';

interface Cloud {
  entity: pc.Entity;
  speed: number;
}

// Estados do clima para controlar as transições
enum WeatherState {
  CLEAR,
  TRANSITION_TO_RAIN,
  RAINING,
  TRANSITION_TO_CLEAR
}

export class CloudManager {
  private app: pc.Application;
  
  // Nuvens
  private clouds: Cloud[] = [];
  private cloudMaterial: pc.StandardMaterial;
  private readonly NUM_CLOUDS = 15; 
  private readonly MAP_SIZE = 100;  
  private readonly CLOUD_HEIGHT_MIN = 15; 
  private readonly CLOUD_HEIGHT_MAX = 25; 

  // Chuva
  private rainEntity: pc.Entity;
  
  // Controle de Clima (Máquina de Estados e Timers)
  private weatherState: WeatherState = WeatherState.CLEAR;
  private timer = 0;
  private timeUntilNextChange = 0;
  private transitionProgress = 0;
  private readonly TRANSITION_DURATION = 5; // Segundos para as nuvens mudarem de cor

  // Cores das nuvens
  private readonly COLOR_CLEAR = new pc.Color(1, 1, 1);       // Branco
  private readonly COLOR_RAIN = new pc.Color(0.3, 0.3, 0.35); // Cinza escuro/azulado

  constructor(app: pc.Application) {
    this.app = app;
    
    // Configura o material base das nuvens
    this.cloudMaterial = new pc.StandardMaterial();
    this.cloudMaterial.diffuse = this.COLOR_CLEAR.clone();
    this.cloudMaterial.specular = new pc.Color(0, 0, 0); 
    //this.cloudMaterial.shininess = 0;
    this.cloudMaterial.blendType = pc.BLEND_NORMAL; 
    this.cloudMaterial.opacity = 0.9; // Um pouco mais opacas para aparecerem bem quando cinzas             
    this.cloudMaterial.depthWrite = false;          
    this.cloudMaterial.update();

    this.spawnClouds();
    
    // Cria o sistema de partículas de chuva
    this.rainEntity = this.createRainSystem();

    // Sorteia o tempo para a primeira chuva (45 a 450 segundos)
    this.scheduleNextRain();
  }

  /**
   * Sorteia o tempo de espera até a próxima chuva
   */
  private scheduleNextRain(): void {
    const minDelay = 4; 
    const maxDelay = 450;
    this.timeUntilNextChange = Math.random() * (maxDelay - minDelay) + minDelay;
    this.timer = 0;
    console.log(`🌤️ Tempo Limpo. Próxima chuva em ${this.timeUntilNextChange.toFixed(0)} segundos.`);
  }

  /**
   * Sorteia quanto tempo a chuva vai durar (ex: 20 a 60 segundos)
   */
  private scheduleRainDuration(): void {
    const minDuration = 20;
    const maxDuration = 60;
    this.timeUntilNextChange = Math.random() * (maxDuration - minDuration) + minDuration;
    this.timer = 0;
    console.log(`🌧️ Começou a chover! Duração: ${this.timeUntilNextChange.toFixed(0)} segundos.`);
  }

  /**
   * Cria a entidade que emite as gotas de chuva
   */
  private createRainSystem(): pc.Entity {
    const rain = new pc.Entity('RainEmitter');
    
    rain.addComponent('particlesystem', {
      numParticles: 2000,        // Máximo de gotas simultâneas
      lifetime: 1.5,             // Tempo que a gota leva caindo
      rate: 0.005,               // Frequência das gotas
      rate2: 0.005,
      emitterShape: pc.EMITTERSHAPE_BOX,
      emitterExtents: new pc.Vec3(this.MAP_SIZE, 0, this.MAP_SIZE), // Cobre todo o céu
      
      // Velocidade de queda no eixo Y (Gravidade forte)
      velocityGraph: new pc.CurveSet([[0, 0], [0, -40], [0, 0]]),
      
      scaleGraph: new pc.Curve([0, 0.05]), // Fininhas como gotas
      stretch: 0.2, // Estica as partículas na vertical dando ilusão de velocidade
      
      // Cor azul/cinza clarinho para a água
      colorGraph: new pc.CurveSet([[0, 0.6], [0, 0.7], [0, 0.8]]), 
      alphaGraph: new pc.Curve([0, 0, 0.1, 0.4, 0.9, 0.4, 1, 0]), // Suaviza o surgimento/desaparecimento
      
      loop: true,
      autoPlay: false // Começa desligado
    });

    rain.setPosition(0, 30, 0); // Posicionado acima das nuvens
    this.app.root.addChild(rain);

    return rain;
  }

  private spawnClouds(): void {
    for (let i = 0; i < this.NUM_CLOUDS; i++) {
      const cloudEntity = this.createSingleCloud(`Cloud-${i}`);
      const startX = (Math.random() - 0.5) * this.MAP_SIZE * 2;
      const startZ = (Math.random() - 0.5) * this.MAP_SIZE * 2;
      const startY = this.CLOUD_HEIGHT_MIN + Math.random() * (this.CLOUD_HEIGHT_MAX - this.CLOUD_HEIGHT_MIN);
      
      cloudEntity.setPosition(startX, startY, startZ);
      const scale = 0.8 + Math.random() * 1.5;
      cloudEntity.setLocalScale(scale, scale, scale);

      this.app.root.addChild(cloudEntity);
      this.clouds.push({
        entity: cloudEntity,
        speed: 1 + Math.random() * 2 
      });
    }
  }

  private createSingleCloud(name: string): pc.Entity {
    const cloudRoot = new pc.Entity(name);
    const numPuffs = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numPuffs; i++) {
      const puff = new pc.Entity(`${name}-puff-${i}`);
      puff.addComponent('render', { type: 'sphere' });
      puff.render!.material = this.cloudMaterial;

      const offsetX = (Math.random() - 0.5) * 2;
      const offsetY = (Math.random() - 0.5) * 0.5; 
      const offsetZ = (Math.random() - 0.5) * 2;
      puff.setLocalPosition(offsetX, offsetY, offsetZ);

      const scaleX = 1 + Math.random() * 1.5;
      const scaleY = 0.8 + Math.random() * 0.5;
      const scaleZ = 1 + Math.random() * 1.5;
      puff.setLocalScale(scaleX, scaleY, scaleZ);

      cloudRoot.addChild(puff);
    }
    return cloudRoot;
  }

  /**
   * Ciclo principal: Move as nuvens e gerencia a lógica da chuva
   */
  update(dt: number): void {
    // 1. Move as nuvens constantemente com o vento
    for (let i = 0; i < this.clouds.length; i++) {
      const cloud = this.clouds[i];
      const pos = cloud.entity.getPosition();

      cloud.entity.translate(cloud.speed * dt, 0, 0);

      if (pos.x > this.MAP_SIZE) {
        const newZ = (Math.random() - 0.5) * this.MAP_SIZE * 2;
        const newY = this.CLOUD_HEIGHT_MIN + Math.random() * (this.CLOUD_HEIGHT_MAX - this.CLOUD_HEIGHT_MIN);
        cloud.entity.setPosition(-this.MAP_SIZE, newY, newZ);
      }
    }

    // 2. Lógica da Máquina de Estados do Clima
    this.timer += dt;

    switch (this.weatherState) {
      case WeatherState.CLEAR:
        if (this.timer >= this.timeUntilNextChange) {
          this.weatherState = WeatherState.TRANSITION_TO_RAIN;
          this.transitionProgress = 0;
        }
        break;

      case WeatherState.TRANSITION_TO_RAIN:
        this.transitionProgress += dt / this.TRANSITION_DURATION;
        // Escurece as nuvens gradativamente usando Lerp (Interpolação Linear)
        this.cloudMaterial.diffuse.lerp(this.COLOR_CLEAR, this.COLOR_RAIN, this.transitionProgress);
        this.cloudMaterial.update();

        if (this.transitionProgress >= 1) {
          this.weatherState = WeatherState.RAINING;
          this.rainEntity.particlesystem?.play(); // Liga a chuva
          this.scheduleRainDuration();
        }
        break;

      case WeatherState.RAINING:
        if (this.timer >= this.timeUntilNextChange) {
          this.weatherState = WeatherState.TRANSITION_TO_CLEAR;
          this.transitionProgress = 0;
          this.rainEntity.particlesystem?.stop(); // Desliga a chuva
        }
        break;

      case WeatherState.TRANSITION_TO_CLEAR:
        this.transitionProgress += dt / this.TRANSITION_DURATION;
        // Clareia as nuvens gradativamente
        this.cloudMaterial.diffuse.lerp(this.COLOR_RAIN, this.COLOR_CLEAR, this.transitionProgress);
        this.cloudMaterial.update();

        if (this.transitionProgress >= 1) {
          this.weatherState = WeatherState.CLEAR;
          this.scheduleNextRain(); // Programa a próxima chuva distante
        }
        break;
    }
  }

  destroy(): void {
    this.clouds.forEach(cloud => cloud.entity.destroy());
    this.clouds = [];
    if (this.rainEntity) this.rainEntity.destroy();
  }
}