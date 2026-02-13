// managers/BuildingManager.ts - Gerencia prédios na cena
import * as pc from 'playcanvas';
import { Building } from '../constants';
import { AssetManager } from './AssetManager';
import { BUILDING_CONFIG, BuildingType } from '@/app/config/buildings';
import { OFFSET } from '../constants';

export class BuildingManager {
  private app: pc.Application;
  private assetManager: AssetManager;

  constructor(app: pc.Application, assetManager: AssetManager) {
    this.app = app;
    this.assetManager = assetManager;
  }

  /**
   * Sincroniza os prédios na cena com a lista de prédios
   */
  syncBuildings(buildings: Building[]): void {
    this.removeDeletedBuildings(buildings);
    this.createOrUpdateBuildings(buildings);
  }

  /**
   * Remove prédios que não existem mais na lista
   */
  private removeDeletedBuildings(buildings: Building[]): void {
    const allEntities = [...this.app.root.children].filter((node) =>
      node.name.startsWith('Building-')
    );

    allEntities.forEach((entity) => {
      const id = parseInt(entity.name.split('-')[1]);
      const stillExists = buildings.some((b) => b.id === id);
      if (!stillExists) {
        console.log(`🗑️ Removendo prédio: ${id}`);
        entity.destroy();
      }
    });
  }

  /**
   * Cria ou atualiza prédios existentes
   */
  private createOrUpdateBuildings(buildings: Building[]): void {
    buildings.forEach((b) => {
      let buildingEntity = this.app.root.findByName(
        `Building-${b.id}`
      ) as pc.Entity;

      if (!buildingEntity) {
        buildingEntity = this.createBuilding(b);
      }

      if (buildingEntity) {
        this.updateBuildingRotation(buildingEntity, b.rotation || 0);
      }
    });
  }

  /**
   * Cria um novo prédio
   */
  private createBuilding(building: Building): pc.Entity | null {
    const asset = this.assetManager.getAsset(building.type);

    if (!asset || !asset.resource) {
      console.warn(`⚠️ Asset não encontrado para: ${building.type}`);
      return null;
    }

    const config = BUILDING_CONFIG[building.type as BuildingType];
    if (!config) {
      console.warn(`⚠️ Config não encontrada para: ${building.type}`);
      return null;
    }

    const buildingEntity = (asset.resource as any).instantiateRenderEntity({
      app: this.app,
    });

    const scale = config.scale || 1;
    buildingEntity.setLocalScale(scale, scale, scale);
    buildingEntity.name = `Building-${building.id}`;

    const worldX = building.x * 2 - OFFSET;
    const worldZ = building.y * 2 - OFFSET;
    buildingEntity.setPosition(worldX, 0, worldZ);

    this.app.root.addChild(buildingEntity);

    // Animação de pop
    this.animateBuildingPop(buildingEntity, scale);

    console.log(`🏢 Prédio criado: ${building.type} (ID: ${building.id})`);

    return buildingEntity;
  }

  /**
   * Anima o aparecimento do prédio (efeito pop)
   */
  private animateBuildingPop(entity: pc.Entity, targetScale: number): void {
    entity.setLocalScale(0, 0, 0);
    let scale = 0;

    const popAnim = setInterval(() => {
      scale += 0.1;
      if (scale >= targetScale) {
        scale = targetScale;
        clearInterval(popAnim);
      }
      entity.setLocalScale(scale, scale, scale);
    }, 16);
  }

  /**
   * Atualiza a rotação de um prédio
   */
  private updateBuildingRotation(entity: pc.Entity, rotation: number): void {
    entity.setEulerAngles(0, rotation, 0);
  }

  /**
   * Verifica se uma posição está ocupada
   */
  isPositionOccupied(x: number, y: number, buildings: Building[]): boolean {
    return buildings.some((b) => b.x === x && b.y === y);
  }
}
