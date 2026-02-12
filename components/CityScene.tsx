'use client'

import { useEffect, useRef, memo } from 'react'
import * as pc from 'playcanvas'
import { BUILDING_CONFIG, BuildingType } from '@/app/config/buildings'
import { cn } from '@/lib/utils'

// Se estiver usando Next.js com React 18+, isso evita erros de SSR com window
if (typeof window !== 'undefined') {
  // O PlayCanvas carrega os módulos necessários automaticamente
}

interface Building {
  id: number
  type: string
  x: number
  y: number
}

interface CitySceneProps {
  buildings: Building[]
  onSelectTile?: (x: number, y: number) => void
}

const CityScene = memo(function CityScene({ buildings, onSelectTile }: CitySceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<pc.Application | null>(null)
  const onSelectTileRef = useRef(onSelectTile)
  
  // Cache para guardar os modelos carregados
  const loadedAssets = useRef<Record<string, pc.Asset>>({})

  useEffect(() => {
    onSelectTileRef.current = onSelectTile
    
  }, [onSelectTile])

  const MAP_SIZE = 48 
  const OFFSET = 20
  const MIN_ZOOM = 5
  const MAX_ZOOM = 50

  // Limites de rotação (em graus)
  const MIN_PITCH = 0  // Limite inferior (não pode olhar muito de baixo)
  const MAX_PITCH = 45  // Limite superior (não pode ficar completamente vertical)
 
  // --- EFEITO 1: INICIALIZAÇÃO ---
  useEffect(() => {
    if (!canvasRef.current) return
    if (appRef.current) return

    console.log("🏗️ Iniciando Engine 3D e Carregando Assets...")

    const canvas = canvasRef.current
    const app = new pc.Application(canvas, {
      mouse: new pc.Mouse(canvas),
      touch: new pc.TouchDevice(canvas),
      elementInput: new pc.ElementInput(canvas)
    })

    Object.entries(BUILDING_CONFIG).forEach(([key, config]) => {
        app.assets.loadFromUrl(config.url, 'container', (err, asset) => {
            if (asset) loadedAssets.current[key] = asset
        })
    })


    appRef.current = app

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

    // --- CARREGAR MODELOS ---
    const loadModel = (key: string, url: string) => {
        // 'container' é o tipo correto para GLB
        app.assets.loadFromUrl(url, 'container', (err, asset) => {
            if (err) {
                console.error(`Erro ao carregar ${key} (${url}):`, err)
                return
            }
            if (asset) {
                console.log(`✅ Modelo carregado: ${key}`)
                loadedAssets.current[key] = asset
            }
        })
    }

    // Carrega todos os modelos da lista
    Object.entries(BUILDING_CONFIG).forEach(([key, config]) => loadModel(key, config.url))

    // --- CENA BÁSICA ---
    const pivot = new pc.Entity('CameraPivot')
    app.root.addChild(pivot)

    const camera = new pc.Entity('Camera')
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.1, 0.1, 0.15),
      projection: pc.PROJECTION_ORTHOGRAPHIC,
      orthoHeight: 20
    })
    camera.setPosition(0, 45, 45) 
    camera.lookAt(0, 0, 0) 
    pivot.addChild(camera)

    const light = new pc.Entity('Light')
    light.addComponent('light', {
      type: 'directional',
      color: new pc.Color(1, 1, 1),
      intensity: 1.5,
      castShadows: true
    })
    light.setEulerAngles(45, 135, 0)
    app.root.addChild(light)

    const ground = new pc.Entity('Ground')
    ground.addComponent('render', { type: 'box' })
    const groundMat = new pc.StandardMaterial()
    groundMat.diffuse = new pc.Color(0.25, 0.3, 0.35)
    groundMat.update()
    ground.render!.material = groundMat
    ground.setLocalScale(MAP_SIZE, 0.1, MAP_SIZE)
    ground.setPosition(0, -0.1, 0)
    app.root.addChild(ground)

    // Cursor (Mantido como caixa para clareza visual, mas pode ser modelo também)
    const cursor = new pc.Entity('Cursor')
    cursor.addComponent('render', { type: 'box' })
    const cursorMat = new pc.StandardMaterial()
    cursorMat.diffuse = new pc.Color(1, 1, 1)
    cursorMat.opacity = 0.5
    cursorMat.blendType = pc.BLEND_NORMAL
    cursorMat.update()
    cursor.render!.material = cursorMat
    cursor.setLocalScale(1.9, 0.2, 1.9)
    cursor.enabled = false
    app.root.addChild(cursor)

    // --- CONTROLES DE MOUSE ---
    const ray = new pc.Ray()
    const hitPosition = new pc.Vec3()
    const rayStart = new pc.Vec3()
    const rayEnd = new pc.Vec3()
    
    let isPanning = false
    let isRotating = false
    let clickStartX = 0
    let clickStartY = 0
    let targetZoom = 20

    // Rastrear ângulos de rotação manualmente
    let currentPitch = 0  // Ângulo inicial (olhando de cima)
    let currentYaw = 0    // Ângulo inicial
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
                // Atualiza os ângulos
                currentPitch -= event.dy * 0.3
                currentYaw -= event.dx * 0.3
                
                // Aplica limites ao pitch (rotação vertical)
                if (currentPitch < MIN_PITCH) {
                    currentPitch = MIN_PITCH
                } else if (currentPitch > MAX_PITCH) {
                    currentPitch = MAX_PITCH
                }
                
                // Aplica a rotação com os limites
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
    })

    return () => {
      window.removeEventListener('resize', resize)
      app.destroy()
      appRef.current = null
    }
  }, []) 


  // --- EFEITO 2: ATUALIZAÇÃO DOS PRÉDIOS COM GLB ---
  useEffect(() => {
    if (!appRef.current) return
    const app = appRef.current

    // Intervalo para verificar se os assets terminaram de carregar
    const checkAssetsInterval = setInterval(() => {
        
        buildings.forEach(b => {
            // Verifica se o prédio já existe na cena
            const existingEntity = app.root.findByName(`Building-${b.id}`)
            
            if (!existingEntity) {
                const asset = loadedAssets.current[b.type]
                
                // Se o asset GLB carregou, instancia ele
                if (asset && asset.resource) {

                    const config = BUILDING_CONFIG[b.type as BuildingType]
                    if (asset && asset.resource && config) {
                        const buildingEntity = (asset.resource as any).instantiateRenderEntity({ app })
                        
                        // Aplica a escala vinda do JSON
                        const s = config.scale
                        buildingEntity.setLocalScale(s, s, s)
                        
                        // Aplica a posição
                        buildingEntity.setPosition((b.x * 2) - OFFSET, 0, (b.y * 2) - OFFSET)
                        app.root.addChild(buildingEntity)
                    


                        // Animação Pop
                        const finalScale = s 
                        let scale = 0
                        buildingEntity.setLocalScale(0, 0, 0)
                        
                        const popAnim = setInterval(() => {
                            scale += 0.1
                            if (scale >= finalScale) {
                                scale = finalScale
                                clearInterval(popAnim)
                            }
                            buildingEntity.setLocalScale(scale, scale, scale)
                        }, 16)
                    }
                } 
                // Se não carregou o GLB, podemos colocar um cubo temporário ou apenas esperar o próximo ciclo
            }
        })

    }, 500) // Tenta a cada meio segundo

    return () => clearInterval(checkAssetsInterval)

  }, [buildings])

  return (
    <canvas 
      ref={canvasRef} 
      className="block w-full h-full outline-none cursor-default touch-none"
      onContextMenu={(e) => e.preventDefault()}
    />
  )
})

export default CityScene