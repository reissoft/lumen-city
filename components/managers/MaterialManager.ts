// managers/MaterialManager.ts - Gerencia materiais da cena
import * as pc from 'playcanvas';
import { GHOST_MATERIAL_CONFIG } from '../constants';

export class MaterialManager {
  private app: pc.Application;
  private ghostMaterial: pc.StandardMaterial;

  constructor(app: pc.Application) {
    this.app = app;
    this.ghostMaterial = this.createGhostMaterial();
  }

  /**
   * Cria o material fantasma para preview de construção
   */
  private createGhostMaterial(): pc.StandardMaterial {
    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color(
      GHOST_MATERIAL_CONFIG.validColor.r,
      GHOST_MATERIAL_CONFIG.validColor.g,
      GHOST_MATERIAL_CONFIG.validColor.b
    );
    mat.opacity = GHOST_MATERIAL_CONFIG.opacity;
    mat.blendType = pc.BLEND_NORMAL;
    mat.emissive = new pc.Color(0, 0.5, 0);
    mat.emissiveIntensity = GHOST_MATERIAL_CONFIG.emissiveIntensity;
    mat.update();
    return mat;
  }

  /**
   * Retorna o material fantasma
   */
  getGhostMaterial(): pc.StandardMaterial {
    return this.ghostMaterial;
  }

  /**
   * Atualiza a cor do material fantasma (válido/inválido)
   */
  setGhostValid(isValid: boolean): void {
    if (isValid) {
      this.ghostMaterial.diffuse.set(
        GHOST_MATERIAL_CONFIG.validColor.r,
        GHOST_MATERIAL_CONFIG.validColor.g,
        GHOST_MATERIAL_CONFIG.validColor.b
      );
      this.ghostMaterial.emissive.set(0, 0.5, 0);
    } else {
      this.ghostMaterial.diffuse.set(
        GHOST_MATERIAL_CONFIG.invalidColor.r,
        GHOST_MATERIAL_CONFIG.invalidColor.g,
        GHOST_MATERIAL_CONFIG.invalidColor.b
      );
      this.ghostMaterial.emissive.set(0.5, 0, 0);
    }
    this.ghostMaterial.update();
  }

  /**
   * Anima a pulsação do material fantasma
   */
  updateGhostPulse(): void {
    const pulse =
      GHOST_MATERIAL_CONFIG.pulseBase +
      Math.sin(Date.now() * GHOST_MATERIAL_CONFIG.pulseSpeed) *
        GHOST_MATERIAL_CONFIG.pulseRange;
    this.ghostMaterial.opacity = pulse;
    this.ghostMaterial.update();
  }
}
