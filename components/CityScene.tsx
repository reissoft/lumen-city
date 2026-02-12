'use client'

import { useEffect, useRef, memo } from 'react'
import * as pc from 'playcanvas'
import { BUILDING_CONFIG, BuildingType } from '@/app/config/buildings'

if (typeof window !== 'undefined') {}

interface Building {
  id: number
  type: string
  x: number
  y: number
}

interface CitySceneProps {
  buildings: Building[]
  onSelectTile?: (x: number, y: number) => void
  activeBuild: string | null // NOVA PROP
}

const CityScene = memo(function CityScene({ buildings, onSelectTile, activeBuild }: CitySceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<pc.Application | null>(null)
  const onSelectTileRef = useRef(onSelectTile)
  
  // Refs para controle interno
  const loadedAssets = useRef<Record<string, pc.Asset>>({})
  const ghostEntity = useRef<pc.Entity | null>(null) // Referência ao holograma
  const ghostMaterial = useRef<pc.StandardMaterial | null>(null) // Material do holograma

  useEffect(() => {
    onSelectTileRef.current = onSelectTile
  }, [onSelectTile])

  const MAP_SIZE = 48 
  const OFFSET = 20
  const MIN_ZOOM = 5
  const MAX_ZOOM = 50
  const MIN_PITCH = 0 
  const MAX_PITCH = 45

  useEffect(() => {
    if (!canvasRef.current) return
    if (appRef.current) return

    console.log("🏗️ Iniciando Engine com Ghost Building...")

    const canvas = canvasRef.current
    const app = new pc.Application(canvas, {
      mouse: new pc.Mouse(canvas),
      touch: new pc.TouchDevice(canvas),
      elementInput: new pc.ElementInput(canvas)
    })
    
    app.setCanvasFillMode(pc.FILLMODE_NONE)
    app.setCanvasResolution(pc.RESOLUTION_AUTO)
    app.start()

    canvas.addEventListener('contextmenu', (e) => e.preventDefault())

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

    // --- CARREGAMENTO DE ASSETS ---
    Object.entries(BUILDING_CONFIG).forEach(([key, config]) => {
        app.assets.loadFromUrl(config.url, 'container', (err, asset) => {
            if (asset) loadedAssets.current[key] = asset
        })
    })

    // --- SKYBOX ---
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
                cubemap: true,
               // fixCubemapSeams: true,
                format: pc.PIXELFORMAT_R8_G8_B8,
                mipmaps: false
            });
            // @ts-ignore
            cubemap.setSource(assets.map(a => a.resource.getSource()));
            
            const envAtlas = pc.EnvLighting.generateAtlas(cubemap);
            app.scene.envAtlas = envAtlas;
            app.scene.skybox = cubemap;
            app.scene.skyboxIntensity = 1; 
            app.scene.exposure = 1;     
           // app.scene.toneMapping = pc.TONEMAP_ACES;   
        } catch (e) { console.warn("Sem skybox") }
    };
    loadSkybox();

    // --- MATERIAL DO GHOST (HOLOGRAMA) ---
    // Criamos um material único que será aplicado ao prédio selecionado
    const ghostMat = new pc.StandardMaterial();
    ghostMat.diffuse = new pc.Color(0, 1, 0); // Começa verde
    ghostMat.opacity = 0.6; // Meio transparente
    ghostMat.blendType = pc.BLEND_NORMAL;
    ghostMat.update();
    ghostMaterial.current = ghostMat;

    // --- CENA ---
    const pivot = new pc.Entity('CameraPivot')
    app.root.addChild(pivot)

    const camera = new pc.Entity('Camera')
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.1, 0.1, 0.15), 
      projection: pc.PROJECTION_ORTHOGRAPHIC,
      orthoHeight: 20,
      farClip: 1000 
    })
    camera.setPosition(0, 45, 45) 
    camera.lookAt(0, 0, 0) 
    pivot.addChild(camera)

    const light = new pc.Entity('Light')
    light.addComponent('light', {
      type: 'directional',
      color: new pc.Color(1, 1, 0.9), 
      intensity: 1.2,
      castShadows: true,
      shadowDistance: 100
    })
    light.setEulerAngles(45, 135, 0)
    app.root.addChild(light)

    app.scene.ambientLight = new pc.Color(0.3, 0.3, 0.4);

    const ground = new pc.Entity('Ground')
    ground.addComponent('render', { type: 'box' })
    const groundMat = new pc.StandardMaterial()
    groundMat.diffuse = new pc.Color(0.2, 0.25, 0.3)
    groundMat.update()
    ground.render!.material = groundMat
    ground.setLocalScale(MAP_SIZE, 0.1, MAP_SIZE)
    ground.setPosition(0, -0.1, 0)
    app.root.addChild(ground)

    // O CURSOR agora é um container vazio que vai carregar o Ghost
    const cursor = new pc.Entity('Cursor')
    cursor.setPosition(0, 0, 0)
    app.root.addChild(cursor)
    ghostEntity.current = cursor // Guardamos ref

    // --- CONTROLES ---
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
                if (currentPitch < MIN_PITCH) currentPitch = MIN_PITCH
                else if (currentPitch > MAX_PITCH) currentPitch = MAX_PITCH
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
        
        // Animação suave do Ghost (Pulsar)
        if (ghostMaterial.current) {
             // Faz a opacidade ir de 0.4 a 0.7
             const pulse = 0.55 + Math.sin(Date.now() * 0.005) * 0.15;
             ghostMaterial.current.opacity = pulse;
             ghostMaterial.current.update();
        }
    })

    return () => {
      window.removeEventListener('resize', resize)
      app.destroy()
      appRef.current = null
    }
  }, []) 


  // --- EFEITO 2: INSTANCIAR PRÉDIOS E GERENCIAR GHOST ---
  useEffect(() => {
    if (!appRef.current) return
    const app = appRef.current
    
    // 1. LÓGICA DO GHOST (HOLOGRAMA)
    // Se o ghostEntity existe (nosso cursor)
    if (ghostEntity.current) {
        // Limpa visuais antigos do cursor
        const children = ghostEntity.current.children;
        while(children.length > 0) {
            children[0].destroy();
        }

        // Se temos uma construção ativa selecionada
        if (activeBuild) {
            const asset = loadedAssets.current[activeBuild];
            const config = BUILDING_CONFIG[activeBuild as BuildingType];
            
            if (asset && asset.resource && config) {
                // Instancia o modelo como filho do cursor
                const ghostModel = (asset.resource as any).instantiateRenderEntity({ app });
                const s = config.scale || 1;
                ghostModel.setLocalScale(s, s, s);
                ghostEntity.current.addChild(ghostModel);

                // Aplica o material transparente em TODAS as partes do modelo
                if (ghostMaterial.current) {
                    const renders = ghostModel.findComponents('render');
                    renders.forEach((render: any) => {
                        render.meshInstances.forEach((meshInstance: any) => {
                            meshInstance.material = ghostMaterial.current;
                        });
                    });
                }
            } else {
                // Fallback: Se o modelo ainda não carregou, usa um cubo
                const box = new pc.Entity();
                box.addComponent('render', { type: 'box' });
                if (ghostMaterial.current) box.render!.material = ghostMaterial.current;
                ghostEntity.current.addChild(box);
            }
        } 
        // Se NÃO tem construção ativa, mostramos o cursor padrão (quadrado branco no chão)
        else {
             const box = new pc.Entity();
             box.addComponent('render', { type: 'box' });
             const mat = new pc.StandardMaterial();
             mat.diffuse = new pc.Color(1, 1, 1);
             mat.opacity = 0.2;
             mat.blendType = pc.BLEND_NORMAL;
             mat.update();
             box.render!.material = mat;
             box.setLocalScale(1.9, 0.1, 1.9);
             ghostEntity.current.addChild(box);
        }
    }


    // 2. CHECK DE COLISÃO (VERDE vs VERMELHO)
    // Atualizamos isso num intervalo rápido ou sempre que activeBuild/buildings mudar
    const updateGhostColor = () => {
        if (!ghostEntity.current || !ghostMaterial.current || !activeBuild) return;

        // Pega posição atual do cursor no grid
        const cursorX = ghostEntity.current.getPosition().x;
        const cursorZ = ghostEntity.current.getPosition().z;
        
        // Converte para grid (reverso da fórmula: world = grid * 2 - OFFSET)
        const gridX = Math.round((cursorX + OFFSET) / 2);
        const gridY = Math.round((cursorZ + OFFSET) / 2);

        // Verifica colisão
        const isOccupied = buildings.some(b => b.x === gridX && b.y === gridY);

        if (isOccupied) {
            // Vermelho (Bloqueado)
            ghostMaterial.current.diffuse.set(1, 0, 0); 
        } else {
            // Verde (Livre)
            ghostMaterial.current.diffuse.set(0, 1, 0); 
        }
        ghostMaterial.current.update();
    }
    
    // Hook no update loop para checar cor em tempo real
    const updateEvent = () => updateGhostColor();
    app.on('update', updateEvent);


    // 3. INSTANCIAR PRÉDIOS REAIS (Código antigo otimizado)
    buildings.forEach(b => {
        const existingEntity = app.root.findByName(`Building-${b.id}`)
        if (!existingEntity) {
            const asset = loadedAssets.current[b.type]
            if (asset && asset.resource) {
                const config = BUILDING_CONFIG[b.type as BuildingType]
                if (config) {
                    const buildingEntity = (asset.resource as any).instantiateRenderEntity({ app })
                    const s = config.scale || 1
                    buildingEntity.setLocalScale(s, s, s)
                    buildingEntity.name = `Building-${b.id}`
                    const worldX = (b.x * 2) - OFFSET
                    const worldZ = (b.y * 2) - OFFSET
                    buildingEntity.setPosition(worldX, 0, worldZ)
                    app.root.addChild(buildingEntity)
                    
                    // Animação Pop
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
    })

    return () => {
        app.off('update', updateEvent);
    }

  }, [buildings, activeBuild]) // Roda quando buildings OU activeBuild mudam

  return (
    <canvas 
      ref={canvasRef} 
      className="block w-full h-full outline-none cursor-none touch-none" // cursor-none para esconder seta do mouse
      onContextMenu={(e) => e.preventDefault()}
    />
  )
})

export default CityScene