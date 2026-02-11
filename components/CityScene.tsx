'use client'

import { useEffect, useRef, memo } from 'react'
import * as pc from 'playcanvas'

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

  // Atualiza a referência da função de clique sem reiniciar nada
  useEffect(() => {
    onSelectTileRef.current = onSelectTile
  }, [onSelectTile])

  const MAP_SIZE = 48 
  const OFFSET = 20 

  // --- EFEITO 1: INICIALIZAÇÃO DA ENGINE (Roda apenas UMA vez) ---
  useEffect(() => {
    if (!canvasRef.current) return
    // Se já existe app, não faz nada (proteção contra Strict Mode)
    if (appRef.current) return 

    console.log("🚀 Iniciando Motor 3D (Setup Único)...")

    const canvas = canvasRef.current
    const app = new pc.Application(canvas, {
      mouse: new pc.Mouse(canvas),
      touch: new pc.TouchDevice(canvas),
      elementInput: new pc.ElementInput(canvas)
    })
    appRef.current = app

    app.setCanvasFillMode(pc.FILLMODE_NONE)
    app.setCanvasResolution(pc.RESOLUTION_AUTO)
    app.start()

    const resize = () => {
      if (canvas && canvas.parentElement) {
        const width = canvas.parentElement.clientWidth
        const height = canvas.parentElement.clientHeight
        app.resizeCanvas(width, height)
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px'
      }
    }
    window.addEventListener('resize', resize)
    setTimeout(resize, 50)

    // CENA BÁSICA (Câmera, Luz, Chão, Cursor)
    const camera = new pc.Entity('Camera')
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.1, 0.1, 0.15),
      projection: pc.PROJECTION_ORTHOGRAPHIC,
      orthoHeight: 20
    })
    camera.setPosition(50, 50, 50)
    camera.lookAt(0, 0, 0)
    app.root.addChild(camera)

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

    // LÓGICA DE MOUSE
    const ray = new pc.Ray()
    const hitPosition = new pc.Vec3()
    const rayStart = new pc.Vec3()
    const rayEnd = new pc.Vec3()

    if (app.mouse) {
        app.mouse.on(pc.EVENT_MOUSEMOVE, (event: any) => {
            if (!camera.camera) return
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
        })

        app.mouse.on(pc.EVENT_MOUSEDOWN, () => {
             if (cursor.enabled && onSelectTileRef.current) {
                const gridX = (cursor.getPosition().x + OFFSET) / 2
                const gridY = (cursor.getPosition().z + OFFSET) / 2
                onSelectTileRef.current(gridX, gridY)
            }
        })
    }

    // Cleanup apenas quando sair da página
    return () => {
      window.removeEventListener('resize', resize)
      app.destroy()
      appRef.current = null
    }
  }, []) // <--- ATENÇÃO: Array vazio aqui! Isso garante que a Engine só inicia 1 vez.


  // --- EFEITO 2: ATUALIZAÇÃO DOS PRÉDIOS (Roda quando buildings muda) ---
  useEffect(() => {
    if (!appRef.current) return
    const app = appRef.current

    // Percorre a lista de prédios e adiciona APENAS os que ainda não existem na cena
    buildings.forEach(b => {
      // Verifica se já criamos este prédio (procurando pelo nome único)
      const existingEntity = app.root.findByName(`Building-${b.id}`)
      
      if (!existingEntity) {
        // Se não existe, CRIA!
        const box = new pc.Entity(`Building-${b.id}`)
        const color = new pc.Color()
        
        if (b.type === 'house') color.set(0.2, 0.6, 1) 
        else if (b.type === 'park') color.set(0.2, 0.8, 0.2) 
        else if (b.type === 'school') color.set(1, 0.3, 0.3) 
        else color.set(1, 0.8, 0) 

        const material = new pc.StandardMaterial()
        material.diffuse = color
        material.update()

        box.addComponent('render', { type: 'box', material: material })
        
        const worldX = (b.x * 2) - OFFSET
        const worldZ = (b.y * 2) - OFFSET
        
        box.setPosition(worldX, 0.5, worldZ)
        box.setLocalScale(1.8, 1.8, 1.8)
        
        // Animação de "Pop" ao nascer (Opcional, mas fica legal)
        box.setLocalScale(0, 0, 0)
        
        app.root.addChild(box)
        
        // Loop de animação manual simples para crescer
        let scale = 0
        const popAnim = setInterval(() => {
            scale += 0.2
            if (scale >= 1.8) {
                scale = 1.8
                clearInterval(popAnim)
            }
            box.setLocalScale(scale, scale, scale)
        }, 16)
      }
    })

  }, [buildings]) // <--- Este efeito roda sempre que a lista muda, mas NÃO recria a engine.

  return (
    <canvas 
      ref={canvasRef} 
      className="block w-full h-full outline-none cursor-crosshair touch-none"
    />
  )
})

export default CityScene