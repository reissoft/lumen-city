'use client'

import { useEffect, useRef, memo, useState } from 'react'
import * as pc from 'playcanvas'
import { BUILDING_CONFIG, BuildingType } from '@/app/config/buildings'

// Previne erros de SSR
if (typeof window !== 'undefined') {}

interface Building {
  id: number
  type: string
  x: number
  y: number
  rotation?: number 
}

interface CitySceneProps {
  buildings: Building[]
  onSelectTile?: (x: number, y: number) => void
  onCancelBuild?: () => void;
  activeBuild: string | null 
  selectedBuildingId: number | null 
}

const CityScene = memo(function CityScene({ buildings, onSelectTile, activeBuild, selectedBuildingId,onCancelBuild }: CitySceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<pc.Application | null>(null)
  const onSelectTileRef = useRef(onSelectTile)
  const onCancelBuildRef = useRef(onCancelBuild) 
  const activeBuildRef = useRef(activeBuild)   
  
  const loadedAssets = useRef<Record<string, pc.Asset>>({})
  const ghostEntity = useRef<pc.Entity | null>(null) 
  const ghostMaterial = useRef<pc.StandardMaterial | null>(null) 
  
  // Referência para guardar o estado anterior e comparar
  const prevBuildingsLength = useRef(0);
    const [assetsReady, setAssetsReady] = useState(false);
  useEffect(() => {
    
    onSelectTileRef.current = onSelectTile
    onCancelBuildRef.current = onCancelBuild 
    activeBuildRef.current = activeBuild 
    
    
  }, [onSelectTile])

  const MAP_SIZE = 48 
  const OFFSET = 20
  const MIN_ZOOM = 5
  const MAX_ZOOM = 50

  // --- EFEITO 1: INICIALIZAÇÃO DA ENGINE (Roda 1 vez) ---
  useEffect(() => {
    if (!canvasRef.current) return
    if (appRef.current) return

    console.log("🚀 Iniciando Engine V2 (Delete/Rotate Fixed)...")

    const canvas = canvasRef.current
    const app = new pc.Application(canvas, {
      mouse: new pc.Mouse(canvas),
      touch: new pc.TouchDevice(canvas),
      elementInput: new pc.ElementInput(canvas),
      graphicsDeviceOptions: {
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false
      }
    })
    
    app.setCanvasFillMode(pc.FILLMODE_NONE)
    app.setCanvasResolution(pc.RESOLUTION_AUTO)
    app.start()


    // Configurações básicas
    const scene = app.scene as any;
    scene.exposure = 1.0; 
    scene.ambientLight = new pc.Color(0.2, 0.2, 0.3); 

    // Carregar Assets
    Object.entries(BUILDING_CONFIG).forEach(([key, config]) => {
        app.assets.loadFromUrl(config.url, 'container', (err, asset) => {
            if (asset) loadedAssets.current[key] = asset
            setAssetsReady(prev => !prev);
        })
    })

    // Skybox
    const loadSkybox = async () => {
        const textureUrls = [
            '/textures/skybox/posx.jpg', '/textures/skybox/negx.jpg',
            '/textures/skybox/posy.jpg', '/textures/skybox/negy.jpg',
            '/textures/skybox/posz.jpg', '/textures/skybox/negz.jpg'
        ];
        try {
            const assets = await Promise.all(textureUrls.map(url => new Promise<pc.Asset>((resolve, reject) => {
                app.assets.loadFromUrl(url, 'texture', (err, asset) => {
                    if (err) reject(err); else if (asset) resolve(asset);
                });
            })));
            const cubemap = new pc.Texture(app.graphicsDevice, {
                cubemap: true,  format: pc.PIXELFORMAT_R8_G8_B8, mipmaps: false
            });
            // @ts-ignore
            cubemap.setSource(assets.map(a => a.resource.getSource()));
            const envAtlas = pc.EnvLighting.generateAtlas(cubemap);
            scene.envAtlas = envAtlas;
            scene.skybox = cubemap;
        } catch (e) { console.warn("Sem skybox") }
    };
    loadSkybox();

    // Materiais
    const ghostMat = new pc.StandardMaterial();
    ghostMat.diffuse = new pc.Color(0, 1, 0); 
    ghostMat.opacity = 0.6;
    ghostMat.blendType = pc.BLEND_NORMAL;
    ghostMat.emissive = new pc.Color(0, 0.5, 0);
    ghostMat.emissiveIntensity = 2;
    ghostMat.update();
    ghostMaterial.current = ghostMat;

    // Câmera e Luzes
    const pivot = new pc.Entity('CameraPivot')
    app.root.addChild(pivot)

    const camera = new pc.Entity('Camera')
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.15, 0.15, 0.2),
      projection: pc.PROJECTION_ORTHOGRAPHIC,
      orthoHeight: 20,
      farClip: 1000 
    })
    camera.setPosition(0, 45, 45) 
    camera.lookAt(0, 0, 0) 
    pivot.addChild(camera)

    const light = new pc.Entity('Light')
    light.addComponent('light', {
      type: 'directional', color: new pc.Color(1, 0.95, 0.9), intensity: 1.5,
      castShadows: true, shadowDistance: 150, shadowResolution: 2048, 
      shadowType: pc.SHADOW_PCF3, normalOffsetBias: 0.05
    })
    light.setEulerAngles(45, 135, 0)
    app.root.addChild(light)

    const ground = new pc.Entity('Ground')
    ground.addComponent('render', { type: 'box' })
    const groundMat = new pc.StandardMaterial()
    groundMat.diffuse = new pc.Color(0.15, 0.18, 0.22) 
    groundMat.update()
    ground.render!.material = groundMat
    ground.setLocalScale(MAP_SIZE, 0.1, MAP_SIZE)
    ground.setPosition(0, -0.1, 0)
    app.root.addChild(ground)

    const cursor = new pc.Entity('Cursor')
    cursor.setPosition(0, 0, 0)
    app.root.addChild(cursor)
    ghostEntity.current = cursor 

    // Inputs
    const ray = new pc.Ray()
    const hitPosition = new pc.Vec3()
    const rayStart = new pc.Vec3()
    const rayEnd = new pc.Vec3()
    
    let isPanning = false
    let isRotating = false
    let clickStartX = 0
    let clickStartY = 0
    let targetZoom = 20
    let currentPitch = 0
    let currentYaw = 0

    pivot.setEulerAngles(currentPitch, currentYaw, 0)

    if (app.mouse) {
        app.mouse.on(pc.EVENT_MOUSEWHEEL, (event: any) => {
            targetZoom -= event.wheel * 5
            if (targetZoom < MIN_ZOOM) targetZoom = MIN_ZOOM
            if (targetZoom > MAX_ZOOM) targetZoom = MAX_ZOOM
        })

        app.mouse.on(pc.EVENT_MOUSEDOWN, (event: any) => {
            if (event.button === pc.MOUSEBUTTON_LEFT) {
                isPanning = true
                clickStartX = event.x
                clickStartY = event.y
            } else if (event.button === pc.MOUSEBUTTON_RIGHT) {
                if (activeBuildRef.current) {
                    if (onCancelBuildRef.current) onCancelBuildRef.current();
                    return; 
                }
                isRotating = true
            }
        })

        app.mouse.on(pc.EVENT_MOUSEUP, (event: any) => {
            if (event.button === pc.MOUSEBUTTON_LEFT) {
                isPanning = false
                const dist = Math.hypot(event.x - clickStartX, event.y - clickStartY)
                if (dist < 5 && cursor.enabled && onSelectTileRef.current) {
                    const gridX = (cursor.getPosition().x + OFFSET) / 2
                    const gridY = (cursor.getPosition().z + OFFSET) / 2
                    onSelectTileRef.current(gridX, gridY)
                }
            } else if (event.button === pc.MOUSEBUTTON_RIGHT) {
                isRotating = false
            }
        })

        app.mouse.on(pc.EVENT_MOUSEMOVE, (event: any) => {
            if (isRotating) {
                currentPitch -= event.dy * 0.3
                currentYaw -= event.dx * 0.3
                if (currentPitch < -10) currentPitch = -10
                else if (currentPitch > 60) currentPitch = 60
                pivot.setEulerAngles(currentPitch, currentYaw, 0)
            }
            if (isPanning) {
                const zoomFactor = camera.camera!.orthoHeight / 20
                pivot.translateLocal(-event.dx * 0.05 * zoomFactor, 0, event.dy * 0.05 * zoomFactor)
            }
            if (camera.camera && !isRotating) {
                camera.camera.screenToWorld(event.x, event.y, camera.camera.nearClip, rayStart)
                camera.camera.screenToWorld(event.x, event.y, camera.camera.farClip, rayEnd)
                ray.origin.copy(rayStart)
                ray.direction.copy(rayEnd).sub(rayStart).normalize()

                if (Math.abs(ray.direction.y) > 0.0001) {
                    const t = -ray.origin.y / ray.direction.y
                    if (t > 0) {
                        hitPosition.copy(ray.origin).add(ray.direction.mulScalar(t))
                        const snapX = Math.round(hitPosition.x / 2) * 2
                        const snapZ = Math.round(hitPosition.z / 2) * 2
                        if (snapX >= -OFFSET && snapX <= OFFSET && snapZ >= -OFFSET && snapZ <= OFFSET) {
                            cursor.enabled = true
                            cursor.setPosition(snapX, 0, snapZ)
                        } else {
                            cursor.enabled = false
                        }
                    }
                }
            }
        })
    }

    app.on('update', (dt) => {
        if (camera.camera) {
            camera.camera.orthoHeight = pc.math.lerp(camera.camera.orthoHeight, targetZoom, dt * 10)
        }
        if (ghostMaterial.current) {
             const pulse = 0.55 + Math.sin(Date.now() * 0.005) * 0.15;
             ghostMaterial.current.opacity = pulse;
             ghostMaterial.current.update();
        }
    })

    const resize = () => {
      if (canvas && canvas.parentElement) {
        const width = canvas.parentElement.clientWidth
        const height = canvas.parentElement.clientHeight
        app.resizeCanvas(width, height)
      }
    }
    window.addEventListener('resize', resize)
    setTimeout(resize, 50)

    appRef.current = app

    


    return () => {
      window.removeEventListener('resize', resize)
      app.destroy()
      appRef.current = null
    }
  }, []) 


  // --- EFEITO 2: SINCRONIZAÇÃO DA CENA (CRUCIAL PARA DELETE E ROTATE) ---
  useEffect(() => {
    if (!appRef.current) return
    const app = appRef.current
    console.log("🔄 Sincronizando Cena. Assets disponíveis:", Object.keys(loadedAssets.current).length);
    // 1. Atualiza Ghost
    if (ghostEntity.current) {
        // Limpa filhos do cursor
        while(ghostEntity.current.children.length > 0) {
            ghostEntity.current.children[0].destroy();
        }

        if (activeBuild) {
            const asset = loadedAssets.current[activeBuild];
            const config = BUILDING_CONFIG[activeBuild as BuildingType];
            if (asset && asset.resource && config) {
                const ghostModel = (asset.resource as any).instantiateRenderEntity({ app });
                const s = config.scale || 1;
                ghostModel.setLocalScale(s, s, s);
                ghostEntity.current.addChild(ghostModel);
                if (ghostMaterial.current) {
                    ghostModel.findComponents('render').forEach((r: any) => {
                        r.meshInstances.forEach((m: any) => m.material = ghostMaterial.current)
                    });
                }
            } else {
                 const box = new pc.Entity();
                 box.addComponent('render', { type: 'box' });
                 if (ghostMaterial.current) box.render!.material = ghostMaterial.current;
                 ghostEntity.current.addChild(box);
            }
        }
    }
    
    // Cor do Ghost
    const updateGhostColor = () => {
         if (!ghostEntity.current || !ghostMaterial.current || !activeBuild) return;
         const cursorX = ghostEntity.current.getPosition().x;
         const cursorZ = ghostEntity.current.getPosition().z;
         const gridX = Math.round((cursorX + OFFSET) / 2);
         const gridY = Math.round((cursorZ + OFFSET) / 2);
         const isOccupied = buildings.some(b => b.x === gridX && b.y === gridY);
         if (isOccupied) ghostMaterial.current.diffuse.set(1, 0, 0); 
         else ghostMaterial.current.diffuse.set(0, 1, 0); 
         ghostMaterial.current.update();
    }
    const updateEvent = () => updateGhostColor();
    app.on('update', updateEvent);


    // --- 2. DELETAR (GARBAGE COLLECTION CORRIGIDO) ---
    // Cria uma CÓPIA do array de filhos usando [...app.root.children]
    // Isso evita erros de índice ao deletar enquanto itera
    const allEntities = [...app.root.children].filter(node => node.name.startsWith('Building-'));
    
    allEntities.forEach(entity => {
        const id = parseInt(entity.name.split('-')[1]);
        const stillExists = buildings.some(b => b.id === id);
        
        if (!stillExists) {
            console.log(`🗑️ Deletando visualmente o ID: ${id}`);
            entity.destroy();
        }
    });


    // --- 3. CRIAR E ATUALIZAR (COM ROTAÇÃO) ---
    buildings.forEach(b => {
        let buildingEntity = app.root.findByName(`Building-${b.id}`) as pc.Entity;
        
        // Se não existe, cria
        if (!buildingEntity) {
            const asset = loadedAssets.current[b.type]
            if (asset && asset.resource) {
                const config = BUILDING_CONFIG[b.type as BuildingType]
                if (config) {
                    buildingEntity = (asset.resource as any).instantiateRenderEntity({ app })
                    const s = config.scale || 1
                    buildingEntity.setLocalScale(s, s, s)
                    buildingEntity.name = `Building-${b.id}`
                    const worldX = (b.x * 2) - OFFSET
                    const worldZ = (b.y * 2) - OFFSET
                    buildingEntity.setPosition(worldX, 0, worldZ)
                    app.root.addChild(buildingEntity)
                    
                    // Pop animation
                    buildingEntity.setLocalScale(0, 0, 0)
                    let scale = 0
                    const popAnim = setInterval(() => {
                        scale += 0.1
                        if (scale >= s) {
                            scale = s
                            clearInterval(popAnim)
                        }
                        buildingEntity.setLocalScale(scale, scale, scale)
                    }, 16)
                }
            }
        }

        // --- ATUALIZAÇÃO DE PROPRIEDADES (ROTAÇÃO) ---
        // Roda para TODOS os prédios, novos ou velhos
        if (buildingEntity) {
            const targetRot = b.rotation || 0;
            // setEulerAngles(x, y, z) -> Giramos no Y (Eixo vertical)
            buildingEntity.setEulerAngles(0, targetRot, 0);
            
            // Log para debug (aparecerá no console do navegador se estiver girando)
            // console.log(`Atualizando prédio ${b.id} para rotação ${targetRot}`);
        }
    })

    return () => { app.off('update', updateEvent); }
  }, [buildings, activeBuild,assetsReady]) // Dependências estritas

  return (
    <canvas 
      ref={canvasRef} 
      className="block w-full h-full outline-none cursor-auto touch-none brightness-110 contrast-125 saturate-110" 
      onContextMenu={(e) => e.preventDefault()}
    />
  )
})

export default CityScene