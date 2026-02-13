'use client'

import { useEffect, useRef, memo, useState } from 'react'
import * as pc from 'playcanvas'
import { CitySceneProps } from './constants'
import { AssetManager } from './managers/AssetManager'
import { MaterialManager } from './managers/MaterialManager'
import { CameraManager } from './managers/CameraManager'
import { BuildingManager } from './managers/BuildingManager'
import { GhostManager } from './managers/GhostManager'
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
  
  // Refs para callbacks (evita recriação de handlers)
  const onSelectTileRef = useRef(onSelectTile)
  const onCancelBuildRef = useRef(onCancelBuild) 
  const activeBuildRef = useRef(activeBuild)   
  
  // Managers
  const assetManagerRef = useRef<AssetManager | null>(null)
  const materialManagerRef = useRef<MaterialManager | null>(null)
  const cameraManagerRef = useRef<CameraManager | null>(null)
  const buildingManagerRef = useRef<BuildingManager | null>(null)
  const ghostManagerRef = useRef<GhostManager | null>(null)
  
  // Controle de assets
  const [assetsReady, setAssetsReady] = useState(false)

  // Atualiza refs quando props mudam
  useEffect(() => {
    onSelectTileRef.current = onSelectTile
    onCancelBuildRef.current = onCancelBuild 
    activeBuildRef.current = activeBuild 
  }, [onSelectTile, onCancelBuild, activeBuild])

  // --- EFEITO 1: INICIALIZAÇÃO DA ENGINE (Roda 1 vez) ---
  useEffect(() => {
    if (!canvasRef.current) return
    if (appRef.current) return

    console.log("🚀 Iniciando Engine V4 (Modular)...")

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

    const cameraManager = new CameraManager(app, {
      onSelectTile: (x, y) => onSelectTileRef.current?.(x, y),
      onCancelBuild: () => onCancelBuildRef.current?.(),
      getActiveBuild: () => activeBuildRef.current
    })
    cameraManagerRef.current = cameraManager

    const buildingManager = new BuildingManager(app, assetManager)
    buildingManagerRef.current = buildingManager

    const ghostManager = new GhostManager(
      app, 
      cameraManager.getCursor(), 
      assetManager, 
      materialManager
    )
    ghostManagerRef.current = ghostManager

    // Configuração da cena
    const sceneSetup = new SceneSetup(app)
    sceneSetup.setupScene()

    // Carrega assets
    assetManager.loadBuildingAssets()

    // Loop de atualização
    app.on('update', (dt) => {
      cameraManager.update(dt)
      materialManager.updateGhostPulse()
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
      app.destroy()
      appRef.current = null
    }
  }, []) 


  // --- EFEITO 2: SINCRONIZAÇÃO DA CENA ---
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
