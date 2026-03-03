// managers/TrainManager.ts - Gerencia trens nos trilhos de trem
import * as pc from 'playcanvas';
import { Building } from '../constants';
import { BUILDING_CONFIG } from '@/app/config/buildings';
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
}

interface Train {
  entity: pc.Entity;
  currentPath: RailNode[];
  currentTargetIndex: number;
  speed: number;
  isMoving: boolean;
  lastMoveTime: number;
  moveInterval: number;
  modelType: string;
}

export class TrainManager {
  private app: pc.Application;
  private railGraph: Map<string, RailNode> = new Map();
  private trains: Train[] = [];
  private trainPool: pc.Entity[] = [];
  private railTypes: string[] = [
    'rail_trilho'
  ];

  // Configurações de tráfego de trem
  private readonly TRAIN_COUNT = 5;
  private readonly TRAIN_SPEED = 0.1;
  private readonly TRAIN_SPAWN_INTERVAL = 5000; // ms
  private lastSpawnTime = 0;

  constructor(app: pc.Application, private assetManager: AssetManager) {
    this.app = app;
    this.setupTrainPool();
  }

  /**
   * Configura o pool de trens (modelos 3D)
   */
  private setupTrainPool(): void {
    for (let i = 0; i < this.TRAIN_COUNT; i++) {
      const trainEntity = new pc.Entity(`Train-${i}`);
      
      // Carrega modelo 3D baseado no tipo
      const modelType = this.getRandomModelType();
      this.loadTrainModel(trainEntity, modelType);
      
      trainEntity.setLocalScale(0.5, 0.5, 0.5); // Escala reduzida para não ficar grande
      trainEntity.enabled = false; // Inicialmente desativado
      this.app.root.addChild(trainEntity);
      this.trainPool.push(trainEntity);
    }
  }

  /**
   * Carrega modelo 3D de trem usando AssetManager ou carregamento direto
   */
  private loadTrainModel(entity: pc.Entity, modelType: string): void {
    // Mapeia o tipo de trem para o caminho do asset
    const trainAssets: Record<string, string> = {
      'locomotive': '/models/infra/train/train-locomotive-c.glb',
      'passenger': '/models/infra/train/train-locomotive-passenger-a.glb',

    };

    const modelUrl = trainAssets[modelType] || trainAssets['locomotive'];
    
    console.log(`🚂 Carregando modelo ${modelType} de: ${modelUrl}`);

   /* // Primeiro tenta usar o AssetManager (se o asset já estiver carregado)
    const assetName = modelUrl.replace('/models/infra/train/', '').replace('.glb', '');
    const existingAsset = this.assetManager.getAsset(assetName);
    
    if (existingAsset && existingAsset.resource) {
      console.log(`🚂 Usando asset já carregado: ${assetName}`);
      this.instantiateTrainModel(entity, existingAsset);
      return;
    }
*/
    // Se não estiver no AssetManager, carrega manualmente
    console.log(`🚂 Asset não encontrado, carregando manualmente: ${modelUrl}`);
    this.loadTrainModelManually(entity, modelUrl);
  }

  /**
   * Instancia modelo 3D a partir de um asset existente
   */
  private instantiateTrainModel(entity: pc.Entity, asset: pc.Asset): void {
    try {
      const trainModel = (asset.resource as any).instantiateRenderEntity({
        app: this.app,
      });
      
      // Limpa o entity existente e adiciona o modelo como filho
      while (entity.children.length > 0) {
        entity.removeChild(entity.children[0]);
      }
      entity.addChild(trainModel);
      
      console.log(`🚂 Modelo de trem carregado com sucesso`);
    } catch (e) {
      console.error(`❌ Erro ao instanciar asset de trem:`, e);
      this.createFallbackTrain(entity, 'locomotive');
    }
  }

  /**
   * Carrega modelo 3D manualmente
   */
  private loadTrainModelManually(entity: pc.Entity, modelUrl: string): void {
    const asset = new pc.Asset('train-model', 'container', { url: modelUrl });
    this.app.assets.add(asset);

    asset.ready(() => {
      if (asset.resource) {
        this.instantiateTrainModel(entity, asset);
      } else {
        console.log(`🚂 Modelo de trem não carregou, usando fallback`);
        this.createFallbackTrain(entity, 'locomotive');
      }
    });

    asset.on('error', (err) => {
      console.log(`🚂 Erro ao carregar modelo de trem:`, err);
      this.createFallbackTrain(entity, 'locomotive');
    });

    this.app.assets.load(asset);
  }

  /**
   * Cria trem fallback (cubo colorido) se modelo 3D falhar
   */
  private createFallbackTrain(entity: pc.Entity, modelType: string): void {
    // Material colorido baseado no tipo de modelo
    const material = new pc.StandardMaterial();
    const colors: Record<string, pc.Color> = {
      'locomotive': new pc.Color(0.5, 0.25, 0),  // Marrom
     // 'cargo': new pc.Color(0.5, 0.5, 0.5),      // Cinza
      'passenger': new pc.Color(0, 0, 1),        // Azul
     // 'freight': new pc.Color(1, 0, 0),          // Vermelho
     // 'steam': new pc.Color(0.8, 0.8, 0.8)       // Prata
    };
    
    material.diffuse = colors[modelType] || colors['locomotive'];
    material.update();
    
    entity.addComponent('render', { type: 'box' });
    entity.render!.material = material;
  }

  /**
   * Atualiza o grafo de trilhos com base nas peças de trilho existentes
   */
  updateRailGraph(buildings: Building[]): void {
    this.railGraph.clear();
    
    // Filtra apenas peças de trilho
    const rails = buildings.filter(b => this.railTypes.includes(b.type));
    
    if (rails.length === 0) {
      return;
    }
    
    // Cria nós para cada peça de trilho
    rails.forEach(rail => {
      const node = this.createRailNode(rail);
      if (node) {
        const key = `${rail.x},${rail.y}`;
        this.railGraph.set(key, node);
      }
    });

    // Conecta nós adjacentes
    this.connectAdjacentRails();
  }

  /**
   * Cria um nó de trilho baseado no tipo de peça
   */
  private createRailNode(rail: Building): RailNode | null {
    const connections = this.getRailConnections(rail.type, rail.rotation || 0);
    if (!connections) return null;

    return {
      x: rail.x,
      y: rail.y,
      connections,
      type: rail.type
    };
  }

  /**
   * Define as conexões para cada tipo de peça de trilho
   */
  private getRailConnections(type: string, rotation: number): RailConnection[] | null {
    const baseConnections: Record<string, RailConnection[]> = {
      'rail_trilho': [{x: -1, y: 0}, {x: 1, y: 0}] // Trilho reto conecta nas extremidades
    };

    const base = baseConnections[type];
    if (!base) return null;

    // Rotaciona as conexões baseado na rotação da peça
    return base.map(conn => this.rotateConnection(conn, rotation));
  }

  /**
   * Rotaciona uma conexão baseado no ângulo
   */
  private rotateConnection(conn: RailConnection, rotation: number): RailConnection {
    const rot = rotation % 360;
    switch (rot) {
      case 0: return conn;
      case 90: return { x: -conn.y, y: conn.x };
      case 180: return { x: -conn.x, y: -conn.y };
      case 270: return { x: conn.y, y: -conn.x };
      default: return conn;
    }
  }

  /**
   * Conecta nós adjacentes que se encaixam
   */
  private connectAdjacentRails(): void {
    this.railGraph.forEach((node, key) => {
      node.connections.forEach(conn => {
        const targetX = node.x + conn.x;
        const targetY = node.y + conn.y;
        const targetKey = `${targetX},${targetY}`;
        
        const targetNode = this.railGraph.get(targetKey);
        if (targetNode) {
          // Verifica se a conexão é válida (双向)
          const reverseConn = { x: -conn.x, y: -conn.y };
          const hasReverse = targetNode.connections.some(c => c.x === reverseConn.x && c.y === reverseConn.y);
          
          if (hasReverse) {
            // Conexão válida, o trem pode passar
          }
        }
      });
    });
  }

  /**
   * Spawna trens aleatoriamente nos trilhos
   */
  spawnTrains(): void {
    const now = Date.now();
    if (now - this.lastSpawnTime < this.TRAIN_SPAWN_INTERVAL) return;
    
    this.lastSpawnTime = now;
    
    // Encontra um nó de trilho aleatório
    const railNodes = Array.from(this.railGraph.values());
    
    if (railNodes.length === 0) {
      return;
    }

    const startNode = railNodes[Math.floor(Math.random() * railNodes.length)];
    
    const train = this.getAvailableTrain();
    
    if (train) {
      this.setupTrain(train, startNode);
    } else {
      console.log('🚂 Nenhum trem disponível no pool');
    }
  }

  /**
   * Obtém um trem disponível do pool
   */
  private getAvailableTrain(): Train | null {
    const availableEntity = this.trainPool.find(train => !train.enabled);
    if (!availableEntity) return null;

    const train: Train = {
      entity: availableEntity,
      currentPath: [],
      currentTargetIndex: 0,
      speed: this.TRAIN_SPEED + Math.random() * 0.05,
      isMoving: false,
      lastMoveTime: Date.now(),
      moveInterval: 2000 + Math.random() * 2000, // Entre 2 e 4 segundos
      modelType: this.getRandomModelType()
    };

    return train;
  }

  /**
   * Obtém um tipo de modelo aleatório
   */
  private getRandomModelType(): string {
    const modelTypes = [
      'locomotive',  'passenger'
    ];
    return modelTypes[Math.floor(Math.random() * modelTypes.length)];
  }

  /**
   * Configura um trem para começar a se mover
   */
  private setupTrain(train: Train, startNode: RailNode): void {
    train.entity.enabled = true;
    console.log(`🚂 Spawnando trem do tipo ${train.modelType} na posição (${startNode.x}, ${startNode.y})`);
    
    // Usa a mesma fórmula de posicionamento do BuildingManager
    const worldX = startNode.x * 2 - OFFSET;
    const worldZ = startNode.y * 2 - OFFSET;
    console.log(`🚂 Posicionando trem em: (${worldX}, 0.6, ${worldZ})`);
    train.entity.setPosition(worldX, 0.6, worldZ);
    train.entity.setLocalScale(0.8, 0.8, 0.8); // Escala correta para visualização
    
    // Gera um caminho aleatório maior para o trem
    train.currentPath = this.generateRandomPath(startNode, 15);
    console.log(`🚂 Caminho gerado com ${train.currentPath.length} nós`);
    train.currentTargetIndex = 0;
    train.isMoving = true;
    
    this.trains.push(train);
  }

  /**
   * Gera um caminho aleatório a partir de um nó
   */
  private generateRandomPath(startNode: RailNode, length: number): RailNode[] {
    const path: RailNode[] = [startNode];
    let currentNode = startNode;
    
    for (let i = 0; i < length; i++) {
      const nextNode = this.getRandomConnectedNode(currentNode);
      if (nextNode) {
        // Verifica se o próximo nó já está no caminho (evita loops)
        const alreadyInPath = path.some(node => node.x === nextNode.x && node.y === nextNode.y);
        
        if (alreadyInPath) {
          continue;
        }
        
        path.push(nextNode);
        currentNode = nextNode;
      } else {
        break;
      }
    }

    return path;
  }

  /**
   * Obtém um nó conectado aleatoriamente
   */
  private getRandomConnectedNode(node: RailNode): RailNode | null {
    const candidates: RailNode[] = [];
    
    node.connections.forEach(conn => {
      const targetX = node.x + conn.x;
      const targetY = node.y + conn.y;
      const targetKey = `${targetX},${targetY}`;
      
      const targetNode = this.railGraph.get(targetKey);
      if (targetNode) {
        candidates.push(targetNode);
      }
    });

    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  /**
   * Atualiza o movimento dos trens
   */
  update(dt: number): void {
    this.spawnTrains();

    // Atualiza cada trem
    for (let i = this.trains.length - 1; i >= 0; i--) {
      const train = this.trains[i];
      
      if (!train.isMoving || train.currentPath.length === 0) {
        this.removeTrain(train);
        this.trains.splice(i, 1);
        continue;
      }

      this.updateTrainMovement(train, dt);
    }
  }

  /**
   * Atualiza o movimento de um trem específico (Sistema Simplificado em Grid com Temporização)
   */
  private updateTrainMovement(train: Train, dt: number): void {
    const now = Date.now();
    
    // Verifica se já passou o tempo de espera para o próximo movimento
    if (now - train.lastMoveTime < train.moveInterval) {
      // Ainda não é hora de se mover, mantém o trem no lugar
      return;
    }

    const targetNode = train.currentPath[train.currentTargetIndex];
    if (!targetNode) {
      return;
    }

    // Usa a mesma fórmula de posicionamento do BuildingManager
    const targetWorldX = targetNode.x * 2 - OFFSET;
    const targetWorldZ = targetNode.y * 2 - OFFSET;
    const targetPos = new pc.Vec3(targetWorldX, 0.6, targetWorldZ);
    
    // Sistema Simplificado: Move instantaneamente para o próximo nó
    train.entity.setPosition(targetPos);
    train.entity.setLocalScale(0.8, 0.8, 0.8);
    
    // Atualiza o tempo do último movimento
    train.lastMoveTime = now;
    
    // Orienta o trem na direção do próximo movimento (se houver)
    if (train.currentTargetIndex + 1 < train.currentPath.length) {
      const nextNode = train.currentPath[train.currentTargetIndex + 1];
      const nextWorldX = nextNode.x * 2 - OFFSET;
      const nextWorldZ = nextNode.y * 2 - OFFSET;
      const nextPos = new pc.Vec3(nextWorldX, 0.6, nextWorldZ);
      
      // Calcula direção para o próximo nó
      const direction = nextPos.sub(targetPos).normalize();
      const angle = Math.atan2(direction.x, direction.z);
      // Corrige a orientação (os trens estavam andando de ré)
      train.entity.setEulerAngles(0, (-angle * (180 / Math.PI)) + 180, 0);
    }
    
    // Vai para o próximo nó
    train.currentTargetIndex++;
    
    if (train.currentTargetIndex >= train.currentPath.length) {
      // Chegou ao fim do caminho
      train.isMoving = false;
    }
  }

  /**
   * Remove um trem do jogo
   */
  private removeTrain(train: Train): void {
    console.log(`🚂 Removendo trem do tipo ${train.modelType} da cena`);
    train.entity.enabled = false;
    train.entity.setPosition(0, -10, 0); // Move para fora da cena
  }

  /**
   * Limpa todos os trens (usado quando a cena é destruída)
   */
  destroy(): void {
    this.trains.forEach(train => {
      train.entity.enabled = false;
      train.entity.destroy();
    });
    this.trainPool.forEach(train => train.destroy());
    this.trains = [];
    this.trainPool = [];
    this.railGraph.clear();
  }
}