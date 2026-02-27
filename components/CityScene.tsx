'use client'

import { useEffect, useRef, memo, useState } from 'react'
import * as pc from 'playcanvas'
import { CitySceneProps } from './constants'
import { AssetManager } from './managers/AssetManager'
import { MaterialManager } from './managers/MaterialManager'
import { CameraManager } from './managers/CameraManager'
import { BuildingManager } from './managers/BuildingManager'
import { GhostManager } from './managers/GhostManager'
import { TrafficManager } from './managers/TrafficManager'
import { SceneSetup } from './setup/SceneSetup'

// Previne erros de SSR
if (typeof window !== 'undefined') {}

const CityScene = memo(function CityScene({ 
  buildings, 
  onSelectTile, 
  activeBuild, 
  selectedBuildingId, 
  onCancelBuild,
  onAssetsLoaded 
}: CitySceneProps) {

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<pc.Application | null>(null)
  
  // Managers
  const assetManagerRef = useRef<AssetManager | null>(null)
  const materialManagerRef = useRef<MaterialManager | null>(null)
  const cameraManagerRef = useRef<CameraManager | null>(null)
  const buildingManagerRef = useRef<BuildingManager | null>(null)
  const ghostManagerRef = useRef<GhostManager | null>(null)
  const trafficManagerRef = useRef<TrafficManager | null>(null)
  
  // Controle de assets
  const [assetsReady, setAssetsReady] = useState(false)

  // --- EFEITO 1: INICIALIZAÇÃO DA ENGINE (Roda 1 vez) ---
  useEffect(() => {
    if (!canvasRef.current) return
    if (appRef.current) return

    console.log("🚀 Iniciando Engine V6 (Callbacks Públicos)...")

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

    // Inicializa managers
    const assetManager = new AssetManager(app, () => {
      console.log("✅ Assets prontos!")
      setAssetsReady(true)
      onAssetsLoaded?.()
    })
    assetManagerRef.current = assetManager

    const materialManager = new MaterialManager(app)
    materialManagerRef.current = materialManager

    // Criar cursor/ghost ANTES do CameraManager
    const cursorEntity = new pc.Entity('Cursor')
    cursorEntity.setPosition(0, 0, 0)
    app.root.addChild(cursorEntity)

    const cameraManager = new CameraManager(app, cursorEntity, {
      onSelectTile: (x, y) => {
        console.log('🎯 onSelectTile chamado dentro do CameraManager:', { x, y })
        // Callback inicial (será atualizado pelo effect abaixo)
      },
      onCancelBuild: () => {
        console.log('🚫 onCancelBuild chamado dentro do CameraManager')
        // Callback inicial (será atualizado pelo effect abaixo)
      },
      getActiveBuild: () => activeBuild
    })
    cameraManagerRef.current = cameraManager

    const buildingManager = new BuildingManager(app, assetManager)
    buildingManagerRef.current = buildingManager

    const ghostManager = new GhostManager(
      app, 
      cursorEntity,
      assetManager, 
      materialManager
    )
    ghostManagerRef.current = ghostManager

    // Inicializa TrafficManager
    const trafficManager = new TrafficManager(app, assetManager)
    trafficManagerRef.current = trafficManager

    // Configuração da cena
    const sceneSetup = new SceneSetup(app)
    sceneSetup.setupScene()

    // Carrega assets
    assetManager.loadBuildingAssets()

    // Loop de atualização
    app.on('update', (dt) => {
      cameraManager.update(dt)
      materialManager.updateGhostPulse()
      trafficManager.update(dt)
    })

    // Resize handler
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
      const trafficManager = trafficManagerRef.current
      if (trafficManager) {
        trafficManager.destroy()
      }
      app.destroy()
      appRef.current = null
    }
  }, []) 

  // --- EFEITO 2: ATUALIZA CALLBACKS (Sempre que props mudam) ---
  useEffect(() => {
    const cameraManager = cameraManagerRef.current
    if (!cameraManager) return

    console.log('🔄 Atualizando callbacks do CameraManager:', {
      hasOnSelectTile: !!onSelectTile,
      hasOnCancelBuild: !!onCancelBuild,
      activeBuild
    })

    // Atualiza diretamente as propriedades públicas
    cameraManager.onSelectTile = (x, y) => {
      console.log('📞 onSelectTile recebido - chamando callback do React:', { x, y })
      onSelectTile?.(x, y)
    }

    cameraManager.onCancelBuild = () => {
      console.log('📞 onCancelBuild recebido - chamando callback do React')
      onCancelBuild?.()
    }

    cameraManager.getActiveBuild = () => activeBuild

  }, [onSelectTile, onCancelBuild, activeBuild])

  // --- EFEITO 3: SINCRONIZAÇÃO DA CENA ---
  useEffect(() => {
    if (!appRef.current || !assetsReady) return
    
    const app = appRef.current
    const ghostManager = ghostManagerRef.current
    const buildingManager = buildingManagerRef.current
    
    if (!ghostManager || !buildingManager) return

    console.log("🔄 Sincronizando Cena...")

    // 1. Atualiza Ghost
    ghostManager.updateGhost(activeBuild)
    
    // 2. Atualiza cor do Ghost
    const updateGhostColor = () => {
      ghostManager.updateGhostColor(buildings, activeBuild)
    }
    app.on('update', updateGhostColor)

    // 3. Sincroniza prédios
    buildingManager.syncBuildings(buildings)

    // 4. Atualiza grafo de tráfego
    const trafficManager = trafficManagerRef.current
    if (trafficManager) {
      trafficManager.updateRoadGraph(buildings)
    }

    return () => { 
      app.off('update', updateGhostColor)
    }
  }, [buildings, activeBuild, assetsReady])

  return (
    <canvas 
      ref={canvasRef} 
      className="block w-full h-full outline-none cursor-auto touch-none brightness-110 contrast-125 saturate-110" 
      onContextMenu={(e) => e.preventDefault()}
    />
  )
})

export default CityScene