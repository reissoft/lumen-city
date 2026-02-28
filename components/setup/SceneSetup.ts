// setup/SceneSetup.ts - Configuração inicial da cena
import * as pc from 'playcanvas';
import {
  LIGHT_CONFIG,
  FOG_CONFIG,
  GROUND_CONFIG,
  MAP_SIZE,
} from '../constants';
import { createGridTexture, loadSkybox } from '../utils/texture';

// --- FUNÇÃO PARA DETECTAR MOBILE ---
const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export class SceneSetup {
  private app: pc.Application;

  constructor(app: pc.Application) {
    this.app = app;
  }

  /**
   * Configura a cena completa
   */
  async setupScene(): Promise<void> {
    this.setupSceneSettings();
    this.setupLighting();
    this.setupGround();
    this.setupFog();
    await this.setupSkybox();
  }

  /**
   * Configurações básicas da cena
   */
  private setupSceneSettings(): void {
    const scene = this.app.scene as any;
    scene.exposure = 1.0;
    scene.ambientLight = new pc.Color(0.2, 0.2, 0.3);
  }

  /**
   * Configura a iluminação direcional
   */
  private setupLighting(): void {
    const light = new pc.Entity('Light');
    light.addComponent('light', {
      type: 'directional',
      color: new pc.Color(
        LIGHT_CONFIG.color.r,
        LIGHT_CONFIG.color.g,
        LIGHT_CONFIG.color.b
      ),
      intensity: LIGHT_CONFIG.intensity,
      // --- OTIMIZAÇÃO DE SOMBRA ---
      castShadows: !isMobile(), // Desativa sombras em dispositivos móveis
      shadowDistance: LIGHT_CONFIG.shadowDistance,
      shadowResolution: isMobile() ? 1024 : 2048, // Resolução menor para mobile se sombras estiverem ativas
      shadowType: pc.SHADOW_PCF3,
      normalOffsetBias: 0.05,
    });

    light.setEulerAngles(
      LIGHT_CONFIG.eulerAngles.x,
      LIGHT_CONFIG.eulerAngles.y,
      LIGHT_CONFIG.eulerAngles.z
    );

    this.app.root.addChild(light);
  }

  /**
   * Configura o chão com grid
   */
  private setupGround(): void {
    const ground = new pc.Entity('Ground');
    ground.addComponent('render', { type: 'box' });

    const groundMat = new pc.StandardMaterial();

    // Cria e aplica a textura de grid
    const gridTexture = createGridTexture(this.app.graphicsDevice);
    groundMat.diffuseMap = gridTexture;

    // Configuração de tiling e offset
    const tileCount = MAP_SIZE / GROUND_CONFIG.tileSize;
    groundMat.diffuseMapTiling.set(tileCount, tileCount);
    groundMat.diffuseMapOffset.set(0.5, 0.5);

    groundMat.update();
    ground.render!.material = groundMat;

    // Escala e posição
    ground.setLocalScale(
      GROUND_CONFIG.scale.x,
      GROUND_CONFIG.scale.y,
      GROUND_CONFIG.scale.z
    );
    ground.setPosition(
      GROUND_CONFIG.position.x,
      GROUND_CONFIG.position.y,
      GROUND_CONFIG.position.z
    );

    this.app.root.addChild(ground);
  }

  /**
   * Configura a neblina
   */
  private setupFog(): void {
    const scene = this.app.scene as any;
    //scene.fog.type = pc.FOG_LINEAR;
   /* scene.fog.color = new pc.Color(
      FOG_CONFIG.color.r,
      FOG_CONFIG.color.g,
      FOG_CONFIG.color.b
    );
    scene.fog.start = FOG_CONFIG.start;
    scene.fog.end = FOG_CONFIG.end;*/
    scene.updateShaders = true;
  }

  /**
   * Carrega o skybox
   */
  private async setupSkybox(): Promise<void> {
    const textureUrls = [
      '/textures/skybox/posx.jpg',
      '/textures/skybox/negx.jpg',
      '/textures/skybox/posy.jpg',
      '/textures/skybox/negy.jpg',
      '/textures/skybox/posz.jpg',
      '/textures/skybox/negz.jpg',
    ];

    await loadSkybox(this.app, textureUrls);
  }
}
