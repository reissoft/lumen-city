// managers/AssetManager.ts - Gerencia carregamento de assets
import * as pc from 'playcanvas';
import { BUILDING_CONFIG, BuildingType } from '@/app/config/buildings';

export class AssetManager {
  private app: pc.Application;
  private loadedAssets: Record<string, pc.Asset> = {};
  private onComplete?: () => void;

  constructor(app: pc.Application, onComplete?: () => void) {
    this.app = app;
    this.onComplete = onComplete;
  }

  /**
   * Carrega todos os assets de prédios
   */
  async loadBuildingAssets(): Promise<void> {
    const buildingKeys = Object.keys(BUILDING_CONFIG);
    const totalAssets = buildingKeys.length;

    if (totalAssets === 0) {
      console.log('📦 Nenhum asset para carregar');
      this.onComplete?.();
      return;
    }

    let loadedCount = 0;

    const promises = buildingKeys.map((key) => {
      return new Promise<void>((resolve) => {
        const config = BUILDING_CONFIG[key as BuildingType];
        this.app.assets.loadFromUrl(config.url, 'container', (err, asset) => {
          if (asset) {
            this.loadedAssets[key] = asset;
            loadedCount++;

            console.log(
              `📦 Asset carregado: ${key} (${loadedCount}/${totalAssets})`
            );

            if (loadedCount === totalAssets) {
              console.log('✅ Todos os assets carregados!');
              this.onComplete?.();
            }
          } else {
            console.error(`❌ Erro ao carregar asset: ${key}`, err);
          }
          resolve();
        });
      });
    });

    await Promise.all(promises);
  }

  /**
   * Retorna um asset carregado
   */
  getAsset(type: string): pc.Asset | undefined {
    return this.loadedAssets[type];
  }

  /**
   * Verifica se um asset está carregado
   */
  hasAsset(type: string): boolean {
    return !!this.loadedAssets[type];
  }

  /**
   * Retorna todos os assets carregados
   */
  getAllAssets(): Record<string, pc.Asset> {
    return this.loadedAssets;
  }
}
