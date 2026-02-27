// managers/TrafficManager.ts - Gerencia tráfego de carros nas ruas
import * as pc from 'playcanvas';
import { Building } from '../constants';
import { BUILDING_CONFIG } from '@/app/config/buildings';
import { OFFSET } from '../constants';

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

  // Configurações de tráfego
  private readonly CAR_COUNT = 15;
  private readonly CAR_SPEED = 0.1;
  private readonly CAR_SPAWN_INTERVAL = 2000; // ms
  private lastSpawnTime = 0;

  constructor(app: pc.Application) {
    this.app = app;
    this.setupCarPool();
  }

  /**
   * Configura o pool de carros (cubos)
   */
  private setupCarPool(): void {
    for (let i = 0; i < this.CAR_COUNT; i++) {
      const carEntity = new pc.Entity(`Car-${i}`);
      carEntity.addComponent('render', { type: 'box' });
      
      // Material colorido para os carros
      const material = new pc.StandardMaterial();
      const colors = [
        new pc.Color(1, 0, 0), // Vermelho
        new pc.Color(0, 0, 1), // Azul
        new pc.Color(1, 1, 0), // Amarelo
        new pc.Color(0, 1, 0), // Verde
        new pc.Color(1, 0, 1), // Magenta
      ];
      material.diffuse = colors[i % colors.length];
      material.update();
      carEntity.render!.material = material;
      
      carEntity.setLocalScale(0.5, 0.5, 0.5);
      carEntity.enabled = false; // Inicialmente desativado
      this.app.root.addChild(carEntity);
      this.carPool.push(carEntity);
    }
  }

  /**
   * Atualiza o grafo de navegação com base nas ruas existentes
   */
  updateRoadGraph(buildings: Building[]): void {
    console.log("🔄 Atualizando grafo de tráfego...");
    console.log("🏗️ Total de prédios no jogo:", buildings.length);
    
    this.roadGraph.clear();
    
    // Filtra apenas peças de rua
    const roads = buildings.filter(b => this.roadTypes.includes(b.type));
    console.log("🛣️ Peças de rua detectadas:", roads.length);
    
    if (roads.length === 0) {
      console.log("⚠️ Nenhuma rua encontrada para criar tráfego!");
      return;
    }
    
    // Cria nós para cada peça de rua
    roads.forEach(road => {
      const node = this.createRoadNode(road);
      if (node) {
        const key = `${road.x},${road.y}`;
        this.roadGraph.set(key, node);
        console.log(`📍 Criado nó de rua: ${road.type} em (${road.x}, ${road.y}) com ${node.connections.length} conexões`);
      } else {
        console.log(`❌ Falha ao criar nó para ${road.type} em (${road.x}, ${road.y})`);
      }
    });

    console.log(`📊 Grafo criado com ${this.roadGraph.size} nós de rua`);

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
    console.log(`🚗 Tentando spawnar carro... Grafo tem ${roadNodes.length} nós`);
    
    if (roadNodes.length === 0) {
      console.log("❌ Nenhum nó de rua disponível para spawnar carro");
      return;
    }

    const startNode = roadNodes[Math.floor(Math.random() * roadNodes.length)];
    console.log(`📍 Spawando carro no nó: ${startNode.type} em (${startNode.x}, ${startNode.y})`);
    
    const car = this.getAvailableCar();
    
    if (car) {
      this.setupCar(car, startNode);
    } else {
      console.log("❌ Nenhum carro disponível no pool");
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
      moveInterval: 1000 + Math.random() * 1000 // Entre 1 e 2 segundos
    };

    return car;
  }

  /**
   * Configura um carro para começar a se mover
   */
  private setupCar(car: Car, startNode: RoadNode): void {
    car.entity.enabled = true;
    
    // Usa a mesma fórmula de posicionamento do BuildingManager
    const worldX = startNode.x * 2 - OFFSET;
    const worldZ = startNode.y * 2 - OFFSET;
    car.entity.setPosition(worldX, 0.6, worldZ);
    
    // Gera um caminho aleatório
    car.currentPath = this.generateRandomPath(startNode, 5);
    car.currentTargetIndex = 0;
    car.isMoving = true;
    
    console.log(`🚗 Carro spawnado em (${startNode.x}, ${startNode.y}) -> PlayCanvas (${worldX.toFixed(2)}, 0.6, ${worldZ.toFixed(2)}) com caminho de ${car.currentPath.length} nós`);
    car.currentPath.forEach((node, index) => {
      const nodeWorldX = node.x * 2 - OFFSET;
      const nodeWorldZ = node.y * 2 - OFFSET;
      console.log(`  🛤️ Nó ${index}: ${node.type} em (${node.x}, ${node.y}) -> PlayCanvas (${nodeWorldX.toFixed(2)}, ${nodeWorldZ.toFixed(2)})`);
    });
    
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
      console.log("❌ Carro sem targetNode válido");
      return;
    }

    // Usa a mesma fórmula de posicionamento do BuildingManager
    const targetWorldX = targetNode.x * 2 - OFFSET;
    const targetWorldZ = targetNode.y * 2 - OFFSET;
    const targetPos = new pc.Vec3(targetWorldX, 0.6, targetWorldZ);
    
    console.log(`🚗 DEBUG: Movimento em Grid - Nó ${car.currentTargetIndex}/${car.currentPath.length}`);
    console.log(`🚗 DEBUG: Target Grid (${targetNode.x}, ${targetNode.y}) -> PlayCanvas (${targetWorldX.toFixed(2)}, 0.6, ${targetWorldZ.toFixed(2)})`);
    
    // Sistema Simplificado: Move instantaneamente para o próximo nó
    car.entity.setPosition(targetPos);
    
    // Atualiza o tempo do último movimento
    car.lastMoveTime = now;
    
    // Orienta o carro na direção do próximo movimento (se houver)
    if (car.currentTargetIndex + 1 < car.currentPath.length) {
      const nextNode = car.currentPath[car.currentTargetIndex + 1];
      const nextWorldX = nextNode.x * 2 - OFFSET;
      const nextWorldZ = nextNode.y * 2 - OFFSET;
      const nextPos = new pc.Vec3(nextWorldX, 0.6, nextWorldZ);
      
      // Calcula direção para o próximo nó
      const direction = nextPos.sub(targetPos).normalize();
      const angle = Math.atan2(direction.x, direction.z);
      car.entity.setEulerAngles(0, -angle * (180 / Math.PI), 0);
      
      console.log(`🚗 DEBUG: Próximo nó: Grid (${nextNode.x}, ${nextNode.y}) -> PlayCanvas (${nextWorldX.toFixed(2)}, 0.6, ${nextWorldZ.toFixed(2)})`);
      console.log(`🚗 DEBUG: Direção: (${direction.x.toFixed(2)}, ${direction.z.toFixed(2)})`);
      console.log(`🚗 DEBUG: Intervalo de movimento: ${car.moveInterval}ms`);
    }
    
    console.log(`📍 Carro movido para: (${targetWorldX.toFixed(2)}, 0.6, ${targetWorldZ.toFixed(2)})`);
    
    // Vai para o próximo nó
    car.currentTargetIndex++;
    
    if (car.currentTargetIndex >= car.currentPath.length) {
      // Chegou ao fim do caminho
      console.log("🏁 Carro chegou ao fim do caminho");
      car.isMoving = false;
    } else {
      console.log(`🚗 DEBUG: Próximo alvo será nó ${car.currentTargetIndex}`);
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