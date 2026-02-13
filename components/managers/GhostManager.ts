// managers/GhostManager.ts - Gerencia o preview fantasma de construção
import * as pc from 'playcanvas';
import { Building, OFFSET } from '../constants';
import { AssetManager } from './AssetManager';
import { MaterialManager } from './MaterialManager';
import { BUILDING_CONFIG, BuildingType } from '@/app/config/buildings';

export class GhostManager {
  private app: pc.Application;
  private assetManager: AssetManager;
  private materialManager: MaterialManager;
  private ghostEntity: pc.Entity;

  constructor(
    app: pc.Application,
    ghostEntity: pc.Entity,
    assetManager: AssetManager,
    materialManager: MaterialManager
  ) {
    this.app = app;
    this.ghostEntity = ghostEntity;
    this.assetManager = assetManager;
    this.materialManager = materialManager;
  }

  /**
   * Atualiza o preview fantasma com base no tipo de construção ativa
   */
  updateGhost(activeBuild: string | null): void {
    // Limpa o ghost atual
    this.clearGhost();

    if (!activeBuild) return;

    const asset = this.assetManager.getAsset(activeBuild);
    const config = BUILDING_CONFIG[activeBuild as BuildingType];

    if (asset && asset.resource && config) {
      this.createGhostFromAsset(asset, config);
    } else {
      this.createPlaceholderGhost();
    }
  }

  /**
   * Remove todos os filhos do ghost entity
   */
  private clearGhost(): void {
    while (this.ghostEntity.children.length > 0) {
      this.ghostEntity.children[0].destroy();
    }
  }

  /**
   * Cria o ghost a partir do asset do prédio
   */
  private createGhostFromAsset(asset: pc.Asset, config: any): void {
    const ghostModel = (asset.resource as any).instantiateRenderEntity({
      app: this.app,
    });

    const scale = config.scale || 1;
    ghostModel.setLocalScale(scale, scale, scale);
    this.ghostEntity.addChild(ghostModel);

    // Aplica o material fantasma
    this.applyGhostMaterial(ghostModel);
  }

  /**
   * Cria um cubo placeholder caso o asset não esteja disponível
   */
  private createPlaceholderGhost(): void {
    const box = new pc.Entity();
    box.addComponent('render', { type: 'box' });
    box.render!.material = this.materialManager.getGhostMaterial();
    this.ghostEntity.addChild(box);
  }

  /**
   * Aplica o material fantasma a todas as mesh instances
   */
  private applyGhostMaterial(entity: pc.Entity): void {
    const ghostMaterial = this.materialManager.getGhostMaterial();

    entity.findComponents('render').forEach((renderComponent: any) => {
      renderComponent.meshInstances.forEach((meshInstance: any) => {
        meshInstance.material = ghostMaterial;
      });
    });
  }

  /**
   * Atualiza a cor do ghost com base na validade da posição
   */
  updateGhostColor(buildings: Building[], activeBuild: string | null): void {
    if (!activeBuild) return;

    const cursorPos = this.ghostEntity.getPosition();
    const gridX = Math.round((cursorPos.x + OFFSET) / 2);
    const gridY = Math.round((cursorPos.z + OFFSET) / 2);

    const isOccupied = buildings.some((b) => b.x === gridX && b.y === gridY);

    this.materialManager.setGhostValid(!isOccupied);
  }

  /**
   * Retorna a entidade do ghost
   */
  getEntity(): pc.Entity {
    return this.ghostEntity;
  }
}
