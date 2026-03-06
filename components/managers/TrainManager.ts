// managers/TrainManager.ts
import * as pc from 'playcanvas';
import { Building } from '../constants';
import { OFFSET } from '../constants';
import { AssetManager } from './AssetManager';

interface RailConnection {
  x: number;
  y: number;
}

interface RailNode {
  x: number;
  y: number;
  connections: RailConnection[];
  type: string;
  linkedNodes?: RailNode[]; 
}

interface Train {
  entities: pc.Entity[];
  currentPath: RailNode[];
  currentTargetIndex: number;
  speed: number;
  isMoving: boolean;
  lastMoveTime: number;
  moveInterval: number;
}

export class TrainManager {
  private app: pc.Application;
  private railGraph: Map<string, RailNode> = new Map();
  private trains: Train[] = [];
  
  private trainPool: pc.Entity[][] = []; 
  private railTypes: string[] = ['rail_trilho'];

  // Configurações do Trem Longo
  private readonly TRAIN_COUNT = 1;
  private readonly TRAIN_LENGTH = 3; 
  
  // NOVO: Controle de tempo dinâmico
  private nextSpawnTime = 0;

  constructor(app: pc.Application, private assetManager: AssetManager) {
    this.app = app;
    this.setupTrainPool();
    this.scheduleNextSpawn(); // Inicia o primeiro cronômetro
  }

  /**
   * Sorteia um tempo aleatório para o próximo trem nascer (entre 5s e 20s)
   */
  private scheduleNextSpawn(): void {
    const minDelay = 5000; // 5 segundos
    const maxDelay = 20000; // 20 segundos
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    
    this.nextSpawnTime = Date.now() + delay;
    console.log(`⏱️ Próximo trem programado para daqui a ${(delay / 1000).toFixed(1)} segundos.`);
  }

  private setupTrainPool(): void {
    for (let i = 0; i < this.TRAIN_COUNT; i++) {
      const trainEntities: pc.Entity[] = [];
      const types = ['locomotive', 'passenger', 'passenger']; 

      for (let j = 0; j < this.TRAIN_LENGTH; j++) {
        const entity = new pc.Entity(`Train-${i}-Car-${j}`);
        this.loadTrainModel(entity, types[j]);
        entity.setLocalScale(0.7, 0.7, 0.7);
        entity.enabled = false;
        this.app.root.addChild(entity);
        trainEntities.push(entity);
      }
      
      this.trainPool.push(trainEntities);
    }
  }

  private loadTrainModel(entity: pc.Entity, modelType: string): void {
    const trainAssets: Record<string, string> = {
      'locomotive': '/models/infra/train/train-locomotive-c.glb',
      'passenger': '/models/infra/train/train-locomotive-passenger-a.glb',
    };
    const modelUrl = trainAssets[modelType] || trainAssets['locomotive'];
    this.loadTrainModelManually(entity, modelUrl);
  }

  private instantiateTrainModel(entity: pc.Entity, asset: pc.Asset): void {
    try {
      const trainModel = (asset.resource as any).instantiateRenderEntity({ app: this.app });
      while (entity.children.length > 0) entity.removeChild(entity.children[0]);
      entity.addChild(trainModel);
    } catch (e) {
      this.createFallbackTrain(entity, 'locomotive');
    }
  }

  private loadTrainModelManually(entity: pc.Entity, modelUrl: string): void {
    const asset = new pc.Asset('train-model', 'container', { url: modelUrl });
    this.app.assets.add(asset);
    asset.ready(() => {
      if (asset.resource) this.instantiateTrainModel(entity, asset);
      else this.createFallbackTrain(entity, 'locomotive');
    });
    asset.on('error', () => this.createFallbackTrain(entity, 'locomotive'));
    this.app.assets.load(asset);
  }

  private createFallbackTrain(entity: pc.Entity, modelType: string): void {
    const material = new pc.StandardMaterial();
    material.diffuse = modelType === 'locomotive' ? new pc.Color(0.5, 0.25, 0) : new pc.Color(0, 0, 1);
    material.update();
    entity.addComponent('render', { type: 'box' });
    entity.render!.material = material;
  }

  updateRailGraph(buildings: Building[]): void {
    this.railGraph.clear();
    const rails = buildings.filter(b => this.railTypes.includes(b.type));
    if (rails.length === 0) return;
    
    rails.forEach(rail => {
      const node = this.createRailNode(rail);
      if (node) {
        node.linkedNodes = [];
        const safeX = Math.round(rail.x);
        const safeY = Math.round(rail.y);
        this.railGraph.set(`${safeX},${safeY}`, node);
      }
    });
    this.connectAdjacentRails();
  }

  private createRailNode(rail: Building): RailNode | null {
    return { x: rail.x, y: rail.y, connections: [], type: rail.type }; 
  }

  private connectAdjacentRails(): void {
    const MAX_DISTANCE = 5;
    const allNodes = Array.from(this.railGraph.values());

    allNodes.forEach(node => {
      if (!node.linkedNodes) node.linkedNodes = [];
      allNodes.forEach(targetNode => {
        if (node.x === targetNode.x && node.y === targetNode.y) return;
        const dist = Math.sqrt(Math.pow(targetNode.x - node.x, 2) + Math.pow(targetNode.y - node.y, 2));
        if (dist <= MAX_DISTANCE) node.linkedNodes!.push(targetNode);
      });
    });
  }

  spawnTrains(): void {
    if (this.trains.length >= 1) return; 

    // NOVO: Verifica se já deu o tempo aleatório sorteado
    if (Date.now() < this.nextSpawnTime) return;
    
    const connectedNodes = Array.from(this.railGraph.values()).filter(n => n.linkedNodes && n.linkedNodes.length > 0);
    
    // Se não tiver trilhos na cidade, empurra o cronômetro para frente para não nascer instantaneamente quando o jogador construir
    if (connectedNodes.length === 0) {
      this.scheduleNextSpawn();
      return;
    }
    
    const tipNodes = connectedNodes.filter(n => n.linkedNodes!.length === 1);
    const startNode = tipNodes.length > 0 
      ? tipNodes[Math.floor(Math.random() * tipNodes.length)] 
      : connectedNodes[Math.floor(Math.random() * connectedNodes.length)];
    
    const train = this.getAvailableTrain();
    if (train) {
      this.setupTrain(train, startNode);
    } else {
      this.scheduleNextSpawn();
    }
  }

  private getAvailableTrain(): Train | null {
    const availableEntities = this.trainPool.find(entities => !entities[0].enabled);
    if (!availableEntities) return null;

    return {
      entities: availableEntities,
      currentPath: [],
      currentTargetIndex: 0,
      speed: 0.1,
      isMoving: false,
      lastMoveTime: Date.now(),
      moveInterval: 1500
    };
  }

  private setupTrain(train: Train, startNode: RailNode): void {
    train.currentPath = this.generateRandomPath(startNode, 20); 
    train.currentTargetIndex = 0;
    train.isMoving = true;
    this.trains.push(train);
  }

  private generateRandomPath(startNode: RailNode, length: number): RailNode[] {
    const path: RailNode[] = [startNode];
    let currentNode = startNode;
    
    for (let i = 0; i < length; i++) {
      const linked = currentNode.linkedNodes || [];
      const validNodes = linked.filter(n => !path.some(p => p.x === n.x && p.y === n.y));
      
      if (validNodes.length > 0) {
        validNodes.sort((a, b) => {
          const distA = Math.sqrt(Math.pow(a.x - currentNode.x, 2) + Math.pow(a.y - currentNode.y, 2));
          const distB = Math.sqrt(Math.pow(b.x - currentNode.x, 2) + Math.pow(b.y - currentNode.y, 2));
          return distA - distB;
        });
        const nextNode = validNodes[0];
        path.push(nextNode);
        currentNode = nextNode;
      } else break;
    }
    return path;
  }

  update(dt: number): void {
    this.spawnTrains();
    for (let i = this.trains.length - 1; i >= 0; i--) {
      const train = this.trains[i];
      if (!train.isMoving || train.currentPath.length === 0) {
        this.removeTrain(train);
        this.trains.splice(i, 1);
        
        // NOVO: Apenas sorteia o próximo tempo DEPOIS que o trem some da tela
        this.scheduleNextSpawn();
        continue;
      }
      this.updateTrainMovement(train, dt);
    }
  }

  private updateTrainMovement(train: Train, dt: number): void {
    const now = Date.now();
    if (now - train.lastMoveTime < train.moveInterval) return;
    train.lastMoveTime = now;

    const currentIndex = train.currentTargetIndex;

    for (let i = 0; i < train.entities.length; i++) {
      const entity = train.entities[i];
      const nodeIndex = currentIndex - i; 

      if (nodeIndex >= 0 && nodeIndex < train.currentPath.length) {
        entity.enabled = true; 
        
        const targetNode = train.currentPath[nodeIndex];
        const worldX = targetNode.x * 2 - OFFSET;
        const worldZ = targetNode.y * 2 - OFFSET;
        const targetPos = new pc.Vec3(worldX, 0.6, worldZ);
        
        entity.setPosition(targetPos);

        if (nodeIndex + 1 < train.currentPath.length) {
          const nextNode = train.currentPath[nodeIndex + 1];
          const nextWorldX = nextNode.x * 2 - OFFSET;
          const nextWorldZ = nextNode.y * 2 - OFFSET;
          const nextPos = new pc.Vec3(nextWorldX, 0.6, nextWorldZ);
          
          const direction = nextPos.sub(targetPos).normalize();
          const angle = Math.atan2(direction.x, direction.z);
          entity.setEulerAngles(0, -angle * (180 / Math.PI), 0);
        }
      } else {
        entity.enabled = false; 
      }
    }

    train.currentTargetIndex++;

    if (currentIndex - train.entities.length + 1 >= train.currentPath.length) {
      train.isMoving = false;
    }
  }

  private removeTrain(train: Train): void {
    train.entities.forEach(entity => {
      entity.enabled = false;
      entity.setPosition(0, -10, 0);
    });
  }

  destroy(): void {
    this.trains.forEach(train => this.removeTrain(train));
    this.trainPool.forEach(entities => entities.forEach(e => e.destroy()));
    this.trains = [];
    this.trainPool = [];
    this.railGraph.clear();
  }
}