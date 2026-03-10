// managers/AirplaneManager.ts - Gerencia os aviões descendo nos aeroportos
import * as pc from 'playcanvas';
import { Building } from '../constants';
import { OFFSET } from '../constants';
import { AssetManager } from './AssetManager';

interface Airplane {
  entity: pc.Entity;
  targetPos: pc.Vec3;
  isActive: boolean;
  speed: number;
}

export class AirplaneManager {
  private app: pc.Application;
  private assetManager: AssetManager;
  private airports: Building[] = [];
  
  private airplanePool: pc.Entity[] = [];
  private activeAirplanes: Airplane[] = [];

  // Configurações do Avião
  private readonly AIRPLANE_COUNT = 1; // 1 avião na tela por vez é suficiente
  private readonly MODEL_URL = '/models/specials/airplane.glb';
  private nextSpawnTime = 0;

  constructor(app: pc.Application, assetManager: AssetManager) {
    this.app = app;
    this.assetManager = assetManager;
    this.setupPool();
    this.scheduleNextSpawn();
  }

  /**
   * Sorteia o tempo para o próximo voo (Entre 5 e 20 segundos)
   */
  private scheduleNextSpawn(): void {
    const minDelay = 5000;
    const maxDelay = 120000;
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    this.nextSpawnTime = Date.now() + delay;
    console.log(`✈️ Próximo avião programado para daqui a ${(delay / 1000).toFixed(1)} segundos.`);
  }

  /**
   * Prepara o modelo 3D do avião na memória
   */
  private setupPool(): void {
    for (let i = 0; i < this.AIRPLANE_COUNT; i++) {
      const entity = new pc.Entity(`Airplane-${i}`);
      this.loadAirplaneModel(entity);
      
      // Tamanho do avião (Ajuste se ficar muito grande ou pequeno)
      entity.setLocalScale(0.6, 0.6, 0.6); 
      entity.enabled = false;
      
      this.app.root.addChild(entity);
      this.airplanePool.push(entity);
    }
  }

  private loadAirplaneModel(entity: pc.Entity): void {
    const asset = new pc.Asset('airplane-model', 'container', { url: this.MODEL_URL });
    this.app.assets.add(asset);
    
    asset.ready(() => {
      if (asset.resource) {
        try {
          const model = (asset.resource as any).instantiateRenderEntity({ app: this.app });
          entity.addChild(model);
        } catch (e) {
          this.createFallback(entity);
        }
      } else {
        this.createFallback(entity);
      }
    });

    asset.on('error', () => this.createFallback(entity));
    this.app.assets.load(asset);
  }

  private createFallback(entity: pc.Entity): void {
    const material = new pc.StandardMaterial();
    material.diffuse = new pc.Color(1, 1, 1); // Branco
    material.update();
    entity.addComponent('render', { type: 'box' });
    entity.render!.material = material;
    // Deixa o fallback com formato de "asa" pra diferenciar
    entity.setLocalScale(1, 0.2, 0.5); 
  }

  /**
   * Atualiza a lista de aeroportos sempre que o jogador constrói ou destrói
   */
  updateAirports(buildings: Building[]): void {
    this.airports = buildings.filter(b => b.type === 'airport');
  }

  /**
   * Tenta spawnar um avião se houver aeroportos e estiver na hora
   */
  private spawnAirplane(): void {
    if (this.activeAirplanes.length >= this.AIRPLANE_COUNT) return;
    if (Date.now() < this.nextSpawnTime) return;

    if (this.airports.length === 0) {
      // Se não tem aeroporto, joga o cronômetro pra frente silenciosamente
      this.scheduleNextSpawn();
      return;
    }

    // Pega um avião invisível do estoque
    const availableEntity = this.airplanePool.find(e => !e.enabled);
    if (!availableEntity) return;

    // Escolhe um aeroporto aleatório
    const targetAirport = this.airports[Math.floor(Math.random() * this.airports.length)];

    // Posição final (No chão, no meio do aeroporto)
    const targetWorldX = targetAirport.x * 2 - OFFSET;
    const targetWorldZ = targetAirport.y * 2 - OFFSET;
    const targetPos = new pc.Vec3(targetWorldX, 0.5, targetWorldZ);

    // Posição inicial (Longe e no alto do céu)
    // Sorteia um ângulo aleatório em volta do aeroporto para ele vir de lugares diferentes
    const spawnAngle = Math.random() * Math.PI * 2;
    const spawnDistance = 40; // Distância horizontal
    const spawnHeight = 20;   // Altura no céu

    const startX = targetWorldX + Math.cos(spawnAngle) * spawnDistance;
    const startZ = targetWorldZ + Math.sin(spawnAngle) * spawnDistance;
    const startPos = new pc.Vec3(startX, spawnHeight, startZ);

    availableEntity.setPosition(startPos);
    availableEntity.setLocalScale(0.002, 0.002, 0.002);
    // Faz o avião olhar para o aeroporto
    availableEntity.lookAt(targetPos);
    
    // 🚨 ATENÇÃO À ROTAÇÃO DO MODELO 3D:
    // O comando "lookAt" aponta a traseira (-Z) ou a frente para o alvo dependendo do GLB.
    // Se o avião estiver voando de ré ou de lado, descomente a linha abaixo e mude o eixo Y (ex: 90, 180, -90):
     availableEntity.rotateLocal(0, 180, 0); 

    availableEntity.enabled = true;

    this.activeAirplanes.push({
      entity: availableEntity,
      targetPos: targetPos,
      isActive: true,
      speed: 3 // Velocidade do avião (ajuste se achar muito rápido/devagar)
    });
  }

  update(dt: number): void {
    this.spawnAirplane();

    for (let i = this.activeAirplanes.length - 1; i >= 0; i--) {
      const airplane = this.activeAirplanes[i];
      
      const currentPos = airplane.entity.getPosition();
      
      // Calcula a direção e a distância até o aeroporto
      const direction = airplane.targetPos.clone().sub(currentPos);
      const distance = direction.length();

      // Se chegou muito perto do chão (menos de 1 bloco de distância), ele "pousou" e some
      if (distance < 1.0) {
        airplane.entity.enabled = false;
        this.activeAirplanes.splice(i, 1);
        this.scheduleNextSpawn(); // Começa a contar de novo para o próximo voo
        continue;
      }

      // Move o avião suavemente na direção do aeroporto
      direction.normalize();
      const moveDistance = airplane.speed * dt;
      airplane.entity.translate(direction.x * moveDistance, direction.y * moveDistance, direction.z * moveDistance);
    }
  }

  destroy(): void {
    this.activeAirplanes = [];
    this.airplanePool.forEach(e => e.destroy());
    this.airplanePool = [];
  }
}