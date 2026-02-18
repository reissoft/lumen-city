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
        // Tenta criar (retorna asset ou cubo)
        const newEntity = this.createBuilding(b);
        if (newEntity) {
          buildingEntity = newEntity;
        }
      }

      if (buildingEntity) {
        this.updateBuildingRotation(buildingEntity, b.rotation || 0);
      }
    });
  }

  /**
   * Cria um novo prédio (Tenta Asset -> Se falhar, cria Cubo)
   */
  private createBuilding(building: Building): pc.Entity {
    const asset = this.assetManager.getAsset(building.type);
    const config = BUILDING_CONFIG[building.type as BuildingType];
    const scale = config?.scale || 1;
    
    let buildingEntity: pc.Entity | null = null;

    // 1. TENTATIVA: Criar a partir do Asset GLB
    if (asset && asset.resource) {
      try {
        // instantiateRenderEntity é específico para assets tipo 'container' (GLB)
        buildingEntity = (asset.resource as any).instantiateRenderEntity({
          app: this.app,
        });
      } catch (e) {
        console.error(`❌ Erro ao instanciar asset para ${building.type}:`, e);
      }
    } else {
        // Log para debug: se você ver isso no console, o asset não carregou ou o nome está errado
        if (!asset) console.warn(`⚠️ Asset não encontrado no Manager: ${building.type}`);
        else console.warn(`⚠️ Asset encontrado mas sem recurso (resource): ${building.type}`);
    }

    // 2. FALLBACK: Se falhou acima (buildingEntity ainda é null), cria o Cubo
    if (!buildingEntity) {
      buildingEntity = new pc.Entity();
      buildingEntity.addComponent('render', { type: 'box' });
      
      // Material cinza para não ficar branco estourado
      const material = new pc.StandardMaterial();
      material.diffuse = new pc.Color(0.5, 0.5, 0.5); 
      material.update();
      if (buildingEntity.render) {
        buildingEntity.render.material = material;
      }
    }

    // 3. Configurações Finais (Nome, Posição, Escala)
    buildingEntity.name = `Building-${building.id}`;
    
    // Configura a escala (seja modelo ou cubo)
    buildingEntity.setLocalScale(scale, scale, scale);

    const worldX = building.x * 2 - OFFSET;
    const worldZ = building.y * 2 - OFFSET;
    buildingEntity.setPosition(worldX, 0, worldZ);

    this.app.root.addChild(buildingEntity);

    // Animação de entrada
    this.animateBuildingPop(buildingEntity, scale);

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