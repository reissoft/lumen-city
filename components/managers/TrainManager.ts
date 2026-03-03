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
  linkedNodes?: RailNode[]; // NOVO: Guarda os vizinhos reais encontrados até a distância 5
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
    const material = new pc.StandardMaterial();
    const colors: Record<string, pc.Color> = {
      'locomotive': new pc.Color(0.5, 0.25, 0),  // Marrom
      'passenger': new pc.Color(0, 0, 1),        // Azul
    };
    
    material.diffuse = colors[modelType] || colors['locomotive'];
    material.update();
    
    entity.addComponent('render', { type: 'box' });
    entity.render!.material = material;
  }

  /**
   * Atualiza o grafo de trilhos com base nas peças de trilho existentes
   */
  /**
   * Atualiza o grafo de trilhos (À PROVA DE BALAS CONTRA DECIMAIS)
   */
  updateRailGraph(buildings: Building[]): void {
    this.railGraph.clear();
    
    const rails = buildings.filter(b => this.railTypes.includes(b.type));
    
    if (rails.length === 0) return;
    
    rails.forEach(rail => {
      const node = this.createRailNode(rail);
      if (node) {
        node.linkedNodes = [];
        // FORÇANDO ARREDONDAMENTO NA CHAVE DO MAPA!
        const safeX = Math.round(rail.x);
        const safeY = Math.round(rail.y);
        const key = `${safeX},${safeY}`;
        
        this.railGraph.set(key, node);
      }
    });

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
    // Arredonda para ignorar floats (ex: 89.999 vira 90) e corrige ângulos negativos (ex: -90 vira 270)
    let rot = Math.round(rotation) % 360;
    if (rot < 0) rot += 360; 

    switch (rot) {
      case 0: return conn;
      case 90: return { x: -conn.y, y: conn.x };
      case 180: return { x: -conn.x, y: -conn.y };
      case 270: return { x: conn.y, y: -conn.x };
      default: return conn; // Se por acaso der um ângulo bizarro, mantém a base
    }
  }

  /**
   * Conecta nós adjacentes (com radar de distância até 5)
   */
  /**
   * Conecta nós adjacentes (Radar com precisão matemática e Debug)
   */
  /**
   * Conecta nós por PROXIMIDADE (Raio de 5 blocos, ignora rotação)
   */
  private connectAdjacentRails(): void {
    const MAX_DISTANCE = 5;
    let totalConnections = 0;

    // Pega todos os trilhos do mapa
    const allNodes = Array.from(this.railGraph.values());

    allNodes.forEach(node => {
      if (!node.linkedNodes) node.linkedNodes = [];

      allNodes.forEach(targetNode => {
        // Ignora a si mesmo
        if (node.x === targetNode.x && node.y === targetNode.y) return;

        // Calcula a distância real entre os dois trilhos (Teorema de Pitágoras)
        const dx = targetNode.x - node.x;
        const dy = targetNode.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Se estiver dentro do alcance de 5 blocos, cria a conexão!
        if (distance <= MAX_DISTANCE) {
          node.linkedNodes!.push(targetNode);
          totalConnections++;
        }
      });
    });

    console.log(`🚂 MAPA MAGNÉTICO PRONTO! Conexões por proximidade: ${totalConnections}`);
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
  /**
   * Gera um caminho inteligente, priorizando trilhos novos
   */
  /**
   * Gera o caminho indo sempre para o trilho vizinho MAIS PRÓXIMO
   */
  private generateRandomPath(startNode: RailNode, length: number): RailNode[] {
    const path: RailNode[] = [startNode];
    let currentNode = startNode;
    
    for (let i = 0; i < length; i++) {
      const linked = currentNode.linkedNodes || [];
      
      // Filtra os trilhos por onde o trem AINDA NÃO passou
      const validNodes = linked.filter(n => !path.some(p => p.x === n.x && p.y === n.y));
      
      if (validNodes.length > 0) {
        // Ordena a lista de vizinhos do mais PERTO para o mais LONGE
        validNodes.sort((a, b) => {
          const distA = Math.sqrt(Math.pow(a.x - currentNode.x, 2) + Math.pow(a.y - currentNode.y, 2));
          const distB = Math.sqrt(Math.pow(b.x - currentNode.x, 2) + Math.pow(b.y - currentNode.y, 2));
          return distA - distB;
        });

        // Pega o primeiro da lista (o mais próximo!)
        const nextNode = validNodes[0];
        path.push(nextNode);
        currentNode = nextNode;
      } else {
        // Beco sem saída
        break;
      }
    }

    return path;
  }

  /**
   * Obtém um nó conectado aleatoriamente (usando a nova lista linkada)
   */
  private getRandomConnectedNode(node: RailNode): RailNode | null {
    // Se não tiver nenhum trilho linkado pelo nosso radar, retorna nulo
    if (!node.linkedNodes || node.linkedNodes.length === 0) {
      return null;
    }
    
    // Sorteia um dos trilhos que estão até a distância 5
    return node.linkedNodes[Math.floor(Math.random() * node.linkedNodes.length)];
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
      train.entity.setEulerAngles(0, -angle * (180 / Math.PI), 0);
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