// utils/texture.ts - Utilitários para criação de texturas
import * as pc from 'playcanvas';
import { GROUND_CONFIG } from '../constants';

/**
 * Cria uma textura de grid procedural para o chão
 */
export const createGridTexture = (device: pc.GraphicsDevice): pc.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Fundo do chão
    ctx.fillStyle = GROUND_CONFIG.backgroundColor;
    ctx.fillRect(0, 0, 64, 64);

    // Linhas da grade
    ctx.strokeStyle = GROUND_CONFIG.gridColor;
    ctx.lineWidth = GROUND_CONFIG.lineWidth;
    ctx.strokeRect(0, 0, 64, 64);
  }

  const texture = new pc.Texture(device, {
    width: 64,
    height: 64,
    format: pc.PIXELFORMAT_R8_G8_B8_A8,
    mipmaps: true,
    anisotropy: 4,
    addressU: pc.ADDRESS_REPEAT,
    addressV: pc.ADDRESS_REPEAT,
  });

  texture.setSource(canvas);
  return texture;
};

/**
 * Carrega skybox a partir de URLs
 */
export const loadSkybox = async (
  app: pc.Application,
  textureUrls: string[]
): Promise<void> => {
  try {
    const assets = await Promise.all(
      textureUrls.map(
        (url) =>
          new Promise<pc.Asset>((resolve, reject) => {
            app.assets.loadFromUrl(url, 'texture', (err, asset) => {
              if (err) reject(err);
              else if (asset) resolve(asset);
            });
          })
      )
    );

    const cubemap = new pc.Texture(app.graphicsDevice, {
      cubemap: true,
      format: pc.PIXELFORMAT_R8_G8_B8,
      mipmaps: false,
    });

    // @ts-ignore
    cubemap.setSource(assets.map((a) => a.resource.getSource()));
    const envAtlas = pc.EnvLighting.generateAtlas(cubemap);
    const scene = app.scene as any;
    scene.envAtlas = envAtlas;
    scene.skybox = cubemap;
  } catch (e) {
    console.warn('Skybox não carregado:', e);
  }
};
