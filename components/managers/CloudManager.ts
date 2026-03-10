// managers/CloudManager.ts - Cria nuvens procedurais flutuantes
import * as pc from 'playcanvas';

interface Cloud {
  entity: pc.Entity;
  speed: number;
}

export class CloudManager {
  private app: pc.Application;
  private clouds: Cloud[] = [];
  private cloudMaterial: pc.StandardMaterial;

  // Configurações do Céu
  private readonly NUM_CLOUDS = 15; // Quantidade de nuvens no céu
  private readonly MAP_SIZE = 100;  // Espaço onde elas podem voar (X e Z)
  private readonly CLOUD_HEIGHT_MIN = 15; // Altura mínima
  private readonly CLOUD_HEIGHT_MAX = 25; // Altura máxima

  constructor(app: pc.Application) {
    this.app = app;
    
    // Cria um material branco, fosco e fofinho para todas as nuvens
    this.cloudMaterial = new pc.StandardMaterial();
    this.cloudMaterial.diffuse = new pc.Color(1, 1, 1, 0.5); // Branco puro
    this.cloudMaterial.specular = new pc.Color(0, 0, 0); // Sem brilho de plástico
    
    
    this.cloudMaterial.update();

    this.spawnClouds();
  }

  /**
   * Cria todas as nuvens ao iniciar o jogo
   */
  private spawnClouds(): void {
    for (let i = 0; i < this.NUM_CLOUDS; i++) {
      const cloudEntity = this.createSingleCloud(`Cloud-${i}`);
      
      // Sorteia uma posição inicial aleatória espalhada pelo mapa
      const startX = (Math.random() - 0.5) * this.MAP_SIZE * 2;
      const startZ = (Math.random() - 0.5) * this.MAP_SIZE * 2;
      const startY = this.CLOUD_HEIGHT_MIN + Math.random() * (this.CLOUD_HEIGHT_MAX - this.CLOUD_HEIGHT_MIN);
      
      cloudEntity.setPosition(startX, startY, startZ);
      
      // Sorteia o tamanho geral desta nuvem
      const scale = 0.8 + Math.random() * 1.5;
      cloudEntity.setLocalScale(scale, scale, scale);

      this.app.root.addChild(cloudEntity);

      this.clouds.push({
        entity: cloudEntity,
        speed: 1 + Math.random() * 2 // Velocidade do vento (quão rápido ela anda)
      });
    }
  }

  /**
   * O truque mágico: Agrupa 3 a 4 esferas para formar uma nuvem!
   */
  private createSingleCloud(name: string): pc.Entity {
    const cloudRoot = new pc.Entity(name);

    // Quantidade de "bolinhas" que formam esta nuvem (entre 3 e 5)
    const numPuffs = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numPuffs; i++) {
      const puff = new pc.Entity(`${name}-puff-${i}`);
      puff.addComponent('render', { type: 'sphere' });
      puff.render!.material = this.cloudMaterial;

      // Posição aleatória perto do centro da nuvem
      const offsetX = (Math.random() - 0.5) * 2;
      const offsetY = (Math.random() - 0.5) * 0.5; // Menos variação na altura para ela ficar "chata" embaixo
      const offsetZ = (Math.random() - 0.5) * 2;
      puff.setLocalPosition(offsetX, offsetY, offsetZ);

      // Tamanhos aleatórios (amassadas no eixo Y para parecerem nuvens reais)
      const scaleX = 1 + Math.random() * 1.5;
      const scaleY = 0.8 + Math.random() * 0.5;
      const scaleZ = 1 + Math.random() * 1.5;
      puff.setLocalScale(scaleX, scaleY, scaleZ);

      cloudRoot.addChild(puff);
    }

    return cloudRoot;
  }

  /**
   * Move as nuvens com o vento. Se sair do mapa, volta do outro lado!
   */
  update(dt: number): void {
    for (let i = 0; i < this.clouds.length; i++) {
      const cloud = this.clouds[i];
      const pos = cloud.entity.getPosition();

      // Move a nuvem no eixo X (Vento soprando para a direita)
      // Multiplicamos por dt para a velocidade ser suave independente dos FPS
      const moveAmount = cloud.speed * dt;
      cloud.entity.translate(moveAmount, 0, 0);

      // Se a nuvem voar para muito longe, teleportamos ela de volta para o início
      if (pos.x > this.MAP_SIZE) {
        const newZ = (Math.random() - 0.5) * this.MAP_SIZE * 2;
        const newY = this.CLOUD_HEIGHT_MIN + Math.random() * (this.CLOUD_HEIGHT_MAX - this.CLOUD_HEIGHT_MIN);
        cloud.entity.setPosition(-this.MAP_SIZE, newY, newZ);
      }
    }
  }

  /**
   * Limpa a memória quando a cena for fechada
   */
  destroy(): void {
    this.clouds.forEach(cloud => cloud.entity.destroy());
    this.clouds = [];
  }
}