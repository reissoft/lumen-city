// managers/TrafficManager.ts - Gerencia tráfego de carros nas ruas
import * as pc from 'playcanvas';
import { Building } from '../constants';
import { BUILDING_CONFIG } from '@/app/config/buildings';
import { OFFSET } from '../constants';
import { AssetManager } from './AssetManager';

interface RoadConnection {
  x: number;
  y: number;
}

interface RoadNode {
  x: number;
  y: number;
  connections: RoadConnection[];
  type: string;
}

interface Car {
  entity: pc.Entity;
  currentPath: RoadNode[];
  currentTargetIndex: number;
  speed: number;
  isMoving: boolean;
  lastMoveTime: number;
  moveInterval: number;
  modelType: string;
}

export class TrafficManager {
  private app: pc.Application;
  private roadGraph: Map<string, RoadNode> = new Map();
  private cars: Car[] = [];
  private carPool: pc.Entity[] = [];
  private roadTypes: string[] = [
    'road_straight', 'road_curve', 'road_crossroad', 'road_bend', 
    'road_intersection', 'road_split', 'road_side', 'road_driveway_single',
    'road_driveway_double', 'road_end', 'road_end_round'
  ];
  
  private railTypes: string[] = [
    'rail_trilho'
  ];

  // Configurações de tráfego
  private readonly CAR_COUNT = 15;
  private readonly CAR_SPEED = 0.1;
  private readonly CAR_SPAWN_INTERVAL = 2000; // ms
  private lastSpawnTime = 0;

  constructor(app: pc.Application, private assetManager: AssetManager) {
    this.app = app;
    this.setupCarPool();
  }

  /**
   * Configura o pool de carros (modelos 3D)
   */
  private setupCarPool(): void {
    for (let i = 0; i < this.CAR_COUNT; i++) {
      const carEntity = new pc.Entity(`Car-${i}`);
      
      // Carrega modelo 3D baseado no tipo
      const modelType = this.getRandomModelType();
      this.loadCarModel(carEntity, modelType);
      
      carEntity.setLocalScale(0.3, 0.3, 0.3); // Escala reduzida para não ficar grande
      carEntity.enabled = false; // Inicialmente desativado
      this.app.root.addChild(carEntity);
      this.carPool.push(carEntity);
    }
  }

  /**
   * Carrega modelo 3D de carro usando AssetManager ou carregamento direto
   */
  private loadCarModel(entity: pc.Entity, modelType: string): void {
    // Mapeia o tipo de carro para o caminho do asset
    const carAssets: Record<string, string> = {
      'sedan': '/models/cars/sedan.glb',
      'suv': '/models/cars/suv.glb',
      'truck': '/models/cars/truck.glb',
      'van': '/models/cars/van.glb',
      'hatchback': '/models/cars/hatchback-sports.glb',
      'sports': '/models/cars/race.glb',
      'police': '/models/cars/police.glb',
      'taxi': '/models/cars/taxi.glb',
      'firetruck': '/models/cars/firetruck.glb',
      'ambulance': '/models/cars/ambulance.glb',
      'garbage': '/models/cars/garbage-truck.glb'
    };

    const modelUrl = carAssets[modelType] || carAssets['sedan'];
    
    console.log(`🚗 Carregando modelo ${modelType} de: ${modelUrl}`);

    // Primeiro tenta usar o AssetManager (se o asset já estiver carregado)
    const assetName = modelUrl.replace('/models/cars/', '').replace('.glb', '');
    const existingAsset = this.assetManager.getAsset(assetName);
    
    if (existingAsset && existingAsset.resource) {
      console.log(`🚗 Usando asset já carregado: ${assetName}`);
      this.instantiateCarModel(entity, existingAsset);
      return;
    }

    // Se não estiver no AssetManager, carrega manualmente
    console.log(`🚗 Asset não encontrado, carregando manualmente: ${modelUrl}`);
    this.loadCarModelManually(entity, modelUrl);
  }

  /**
   * Instancia modelo 3D a partir de um asset existente
   */
  private instantiateCarModel(entity: pc.Entity, asset: pc.Asset): void {
    try {
      const carModel = (asset.resource as any).instantiateRenderEntity({
        app: this.app,
      });
      
      // Limpa o entity existente e adiciona o modelo como filho
      while (entity.children.length > 0) {
        entity.removeChild(entity.children[0]);
      }
      entity.addChild(carModel);
      
      console.log(`🚗 Modelo carregado com sucesso`);
    } catch (e) {
      console.error(`❌ Erro ao instanciar asset:`, e);
      this.createFallbackCar(entity, 'sedan');
    }
  }

  /**
   * Carrega modelo 3D manualmente
   */
  private loadCarModelManually(entity: pc.Entity, modelUrl: string): void {
    const asset = new pc.Asset('car-model', 'container', { url: modelUrl });
    this.app.assets.add(asset);

    asset.ready(() => {
      if (asset.resource) {
        this.instantiateCarModel(entity, asset);
      } else {
        console.log(`🚗 Modelo não carregou, usando fallback`);
        this.createFallbackCar(entity, 'sedan');
      }
    });

    asset.on('error', (err) => {
      console.log(`🚗 Erro ao carregar modelo:`, err);
      this.createFallbackCar(entity, 'sedan');
    });

    this.app.assets.load(asset);
  }

  /**
   * Cria carro fallback (cubo colorido) se modelo 3D falhar
   */
  private createFallbackCar(entity: pc.Entity, modelType: string): void {
    // Material colorido baseado no tipo de modelo
    const material = new pc.StandardMaterial();
    const colors: Record<string, pc.Color> = {
      'sedan': new pc.Color(1, 0, 0),     // Vermelho
      'suv': new pc.Color(0, 0, 1),       // Azul
      'truck': new pc.Color(1, 1, 0),     // Amarelo
      'van': new pc.Color(0, 1, 0),       // Verde
      'hatchback': new pc.Color(1, 0, 1)  // Magenta
    };
    
    material.diffuse = colors[modelType] || colors['sedan'];
    material.update();
    
    entity.addComponent('render', { type: 'box' });
    entity.render!.material = material;
  }

  /**
   * Atualiza o grafo de navegação com base nas ruas existentes
   */
  updateRoadGraph(buildings: Building[]): void {
    this.roadGraph.clear();
    
    // Filtra apenas peças de rua
    const roads = buildings.filter(b => this.roadTypes.includes(b.type));
    
    if (roads.length === 0) {
      return;
    }
    
    // Cria nós para cada peça de rua
    roads.forEach(road => {
      const node = this.createRoadNode(road);
      if (node) {
        const key = `${road.x},${road.y}`;
        this.roadGraph.set(key, node);
      }
    });

    // Conecta nós adjacentes
    this.connectAdjacentRoads();
  }

  /**
   * Cria um nó de estrada baseado no tipo de peça
   */
  private createRoadNode(road: Building): RoadNode | null {
    const connections = this.getRoadConnections(road.type, road.rotation || 0);
    if (!connections) return null;

    return {
      x: road.x,
      y: road.y,
      connections,
      type: road.type
    };
  }

  /**
   * Define as conexões para cada tipo de peça de rua
   */
  private getRoadConnections(type: string, rotation: number): RoadConnection[] | null {
    const baseConnections: Record<string, RoadConnection[]> = {
      'road_straight': [{x: -1, y: 0}, {x: 1, y: 0}],
      'road_curve': [{x: -1, y: 0}, {x: 0, y: 1}],
      'road_crossroad': [{x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}],
      'road_bend': [{x: -1, y: 0}, {x: 0, y: 1}],
      'road_intersection': [{x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}],
      'road_split': [{x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}],
      'road_side': [{x: -1, y: 0}, {x: 1, y: 0}],
      'road_driveway_single': [{x: -1, y: 0}, {x: 0, y: 1}],
      'road_driveway_double': [{x: -1, y: 0}, {x: 0, y: 1}],
      'road_end': [{x: -1, y: 0}],
      'road_end_round': [{x: -1, y: 0}]
    };

    const base = baseConnections[type];
    if (!base) return null;

    // Rotaciona as conexões baseado na rotação da peça
    return base.map(conn => this.rotateConnection(conn, rotation));
  }

  /**
   * Rotaciona uma conexão baseado no ângulo
   */
  private rotateConnection(conn: RoadConnection, rotation: number): RoadConnection {
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
  private connectAdjacentRoads(): void {
    this.roadGraph.forEach((node, key) => {
      node.connections.forEach(conn => {
        const targetX = node.x + conn.x;
        const targetY = node.y + conn.y;
        const targetKey = `${targetX},${targetY}`;
        
        const targetNode = this.roadGraph.get(targetKey);
        if (targetNode) {
          // Verifica se a conexão é válida (双向)
          const reverseConn = { x: -conn.x, y: -conn.y };
          const hasReverse = targetNode.connections.some(c => c.x === reverseConn.x && c.y === reverseConn.y);
          
          if (hasReverse) {
            // Conexão válida, o carro pode passar
          }
        }
      });
    });
  }

  /**
   * Spawna carros aleatoriamente nas ruas
   */
  spawnCars(): void {
    const now = Date.now();
    if (now - this.lastSpawnTime < this.CAR_SPAWN_INTERVAL) return;
    
    this.lastSpawnTime = now;
    
    // Encontra um nó de estrada aleatório
    const roadNodes = Array.from(this.roadGraph.values());
    
    if (roadNodes.length === 0) {
      return;
    }

    const startNode = roadNodes[Math.floor(Math.random() * roadNodes.length)];
    
    const car = this.getAvailableCar();
    
    if (car) {
      this.setupCar(car, startNode);
    }
  }

  /**
   * Obtém um carro disponível do pool
   */
  private getAvailableCar(): Car | null {
    const availableEntity = this.carPool.find(car => !car.enabled);
    if (!availableEntity) return null;

    const car: Car = {
      entity: availableEntity,
      currentPath: [],
      currentTargetIndex: 0,
      speed: this.CAR_SPEED + Math.random() * 0.05,
      isMoving: false,
      lastMoveTime: Date.now(),
      moveInterval: 1000 + Math.random() * 1000, // Entre 1 e 2 segundos
      modelType: this.getRandomModelType()
    };

    return car;
  }

  /**
   * Obtém um tipo de modelo aleatório
   */
  private getRandomModelType(): string {
    const modelTypes = [
      'sedan', 'suv', 'truck', 'van', 'hatchback',
      'sports', 'police', 'taxi', 'firetruck', 'ambulance', 'garbage'
    ];
    return modelTypes[Math.floor(Math.random() * modelTypes.length)];
  }

  /**
   * Configura um carro para começar a se mover
   */
  private setupCar(car: Car, startNode: RoadNode): void {
    car.entity.enabled = true;
    //console.log(`🚗 Spawnando carro do tipo ${car.modelType} na posição (${startNode.x}, ${startNode.y})`);
    // Usa a mesma fórmula de posicionamento do BuildingManager
    const worldX = startNode.x * 2 - OFFSET;
    const worldZ = startNode.y * 2 - OFFSET;
    //console.log(`🚗 Posicionando carro em: (${worldX}, 0.6, ${worldZ})`);
    car.entity.setPosition(worldX, 0.1, worldZ);
    car.entity.setLocalScale(0.0, 0.0, 0.0); // Escala reduzida para não ficar grande
    // Gera um caminho aleatório
    car.currentPath = this.generateRandomPath(startNode, 5);
    //console.log(`🚗 Caminho gerado com ${car.currentPath.length} nós`);
    car.currentTargetIndex = 0;
    car.isMoving = true;
    
    this.cars.push(car);
  }

  /**
   * Gera um caminho aleatório a partir de um nó
   */
  private generateRandomPath(startNode: RoadNode, length: number): RoadNode[] {
    const path: RoadNode[] = [startNode];
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
  private getRandomConnectedNode(node: RoadNode): RoadNode | null {
    const candidates: RoadNode[] = [];
    
    node.connections.forEach(conn => {
      const targetX = node.x + conn.x;
      const targetY = node.y + conn.y;
      const targetKey = `${targetX},${targetY}`;
      
      const targetNode = this.roadGraph.get(targetKey);
      if (targetNode) {
        candidates.push(targetNode);
      }
    });

    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  /**
   * Atualiza o movimento dos carros
   */
  update(dt: number): void {
    this.spawnCars();

    // Atualiza cada carro
    for (let i = this.cars.length - 1; i >= 0; i--) {
      const car = this.cars[i];
      
      if (!car.isMoving || car.currentPath.length === 0) {
        this.removeCar(car);
        this.cars.splice(i, 1);
        continue;
      }

      this.updateCarMovement(car, dt);
    }
  }

  /**
   * Atualiza o movimento de um carro específico (Sistema Simplificado em Grid com Temporização)
   */
  private updateCarMovement(car: Car, dt: number): void {
    const now = Date.now();
    
    // Verifica se já passou o tempo de espera para o próximo movimento
    if (now - car.lastMoveTime < car.moveInterval) {
      // Ainda não é hora de se mover, mantém o carro no lugar
      return;
    }

    const targetNode = car.currentPath[car.currentTargetIndex];
    if (!targetNode) {
      return;
    }

    // Usa a mesma fórmula de posicionamento do BuildingManager
    const targetWorldX = targetNode.x * 2 - OFFSET;
    const targetWorldZ = targetNode.y * 2 - OFFSET;
    const targetPos = new pc.Vec3(targetWorldX, 0.1, targetWorldZ);
    
    // Sistema Simplificado: Move instantaneamente para o próximo nó
    car.entity.setPosition(targetPos);
    car.entity.setLocalScale(0.4, 0.4, 0.4);
    // Atualiza o tempo do último movimento
    car.lastMoveTime = now;
    
    // Orienta o carro na direção do próximo movimento (se houver)
    if (car.currentTargetIndex + 1 < car.currentPath.length) {
      const nextNode = car.currentPath[car.currentTargetIndex + 1];
      const nextWorldX = nextNode.x * 2 - OFFSET;
      const nextWorldZ = nextNode.y * 2 - OFFSET;
      const nextPos = new pc.Vec3(nextWorldX, 0.1, nextWorldZ);
      
      // Calcula direção para o próximo nó
      const direction = nextPos.sub(targetPos).normalize();
      const angle = Math.atan2(direction.x, direction.z);
      // Corrige a orientação (os carros estavam andando de ré)
      car.entity.setEulerAngles(0, (-angle * (180 / Math.PI)) + 180, 0);
    }
    
    // Vai para o próximo nó
    car.currentTargetIndex++;
    
    if (car.currentTargetIndex >= car.currentPath.length) {
      // Chegou ao fim do caminho
      car.isMoving = false;
    }
  }

  /**
   * Remove um carro do jogo
   */
  private removeCar(car: Car): void {
    car.entity.enabled = false;
    car.entity.setPosition(0, -10, 0); // Move para fora da cena
  }

  /**
   * Limpa todos os carros (usado quando a cena é destruída)
   */
  destroy(): void {
    this.cars.forEach(car => {
      car.entity.enabled = false;
      car.entity.destroy();
    });
    this.carPool.forEach(car => car.destroy());
    this.cars = [];
    this.carPool = [];
    this.roadGraph.clear();
  }
}