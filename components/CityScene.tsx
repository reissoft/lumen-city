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
import { TrainManager } from './managers/TrainManager'
import { AirplaneManager } from './managers/AirplaneManager'
import { CloudManager } from './managers/CloudManager'
import { DayNightManager } from './managers/DayNightManager'
import { SceneSetup } from './setup/SceneSetup'
import { DEVICETYPE_WEBGL1 } from 'playcanvas'

// Previne erros de SSR
if (typeof window !== 'undefined') {}

// Função para detectar WebGL
const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch (e) {
    return false
  }
}

const CityScene = memo(function CityScene({ 
  buildings, 
  onSelectTile, 
  activeBuild, 
  selectedBuildingId, 
  onCancelBuild,
  onAssetsLoaded,
  buildRotation = 0,
  onTimeUpdate
}: CitySceneProps & { buildRotation?: number, onTimeUpdate?: (time: number) => void }) {

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<pc.Application | null>(null)
  
  // Managers
  const assetManagerRef = useRef<AssetManager | null>(null)
  const materialManagerRef = useRef<MaterialManager | null>(null)
  const cameraManagerRef = useRef<CameraManager | null>(null)
  const buildingManagerRef = useRef<BuildingManager | null>(null)
  const ghostManagerRef = useRef<GhostManager | null>(null)
  const trafficManagerRef = useRef<TrafficManager | null>(null)
  const trainManagerRef = useRef<TrainManager | null>(null)
  const airplaneManagerRef = useRef<AirplaneManager | null>(null)
  const cloudManagerRef = useRef<CloudManager | null>(null)
  const dayNightManagerRef = useRef<DayNightManager | null>(null)
  
  // Controle de assets
  const [assetsReady, setAssetsReady] = useState(false)
  const [webglSupported, setWebglSupported] = useState(true)
  const [webglError, setWebglError] = useState<string | null>(null)

  // --- EFEITO 0: VERIFICAÇÃO DE WEBGL ---
  useEffect(() => {
    const isSupported = checkWebGLSupport()
    setWebglSupported(isSupported)
    
    if (!isSupported) {
      setWebglError("Seu navegador não suporta WebGL. Por favor, atualize seu navegador ou use um navegador compatível.")
      console.error("WebGL não suportado")
    }
  }, [])

  // --- EFEITO 1: INICIALIZAÇÃO DA ENGINE (Roda 1 vez) ---
  useEffect(() => {
    if (!canvasRef.current) return
    if (appRef.current) return
    if (!webglSupported) return

    console.log("🚀 Iniciando Engine V6 (Callbacks Públicos)...")

    const canvas = canvasRef.current
    const app = new pc.Application(canvas, {
      mouse: new pc.Mouse(canvas),
      touch: new pc.TouchDevice(canvas),
      elementInput: new pc.ElementInput(canvas),
      graphicsDeviceOptions: {
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
          deviceTypes: ['webgl1',DEVICETYPE_WEBGL1]
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
      },
      onCancelBuild: () => {
        console.log('🚫 onCancelBuild chamado dentro do CameraManager')
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

    const trafficManager = new TrafficManager(app, assetManager)
    trafficManagerRef.current = trafficManager

    const trainManager = new TrainManager(app, assetManager)
    trainManagerRef.current = trainManager

    const airplaneManager = new AirplaneManager(app, assetManager)
    airplaneManagerRef.current = airplaneManager

    const cloudManager = new CloudManager(app)
    cloudManagerRef.current = cloudManager

    // Configuração da cena
    const sceneSetup = new SceneSetup(app)
    sceneSetup.setupScene()

    const dayNightManager = new DayNightManager(app);
    dayNightManager.setCamera(cameraManager.getCamera());
    dayNightManagerRef.current = dayNightManager;

    // Carrega assets
    assetManager.loadBuildingAssets()

    // Loop de atualização
    app.on('update', (dt) => {
      cameraManager.update(dt)
      materialManager.updateGhostPulse()
      trafficManager.update(dt)
      trainManager.update(dt)
      airplaneManager.update(dt)
      cloudManager.update(dt)
      dayNightManager.update(dt)
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
      if (trafficManager) trafficManager.destroy()
      
      const trainManager = trainManagerRef.current
      if (trainManager) trainManager.destroy()

      const airplaneManager = airplaneManagerRef.current
      if (airplaneManager) airplaneManager.destroy()

      const cloudManager = cloudManagerRef.current
      if (cloudManager) cloudManager.destroy()

      const dayNightManager = dayNightManagerRef.current
      if (dayNightManager) dayNightManagerRef.current = null

      app.destroy()
      appRef.current = null
    }
  }, [webglSupported])

  // --- EFEITO 2: ATUALIZA CALLBACKS (Sempre que props mudam) ---
  useEffect(() => {
    const cameraManager = cameraManagerRef.current
    if (cameraManager) {
      cameraManager.onSelectTile = (x, y) => onSelectTile?.(x, y)
      cameraManager.onCancelBuild = () => onCancelBuild?.()
      cameraManager.getActiveBuild = () => activeBuild
    }

    // 👇 AQUI ESTAVA FALTANDO A LIGAÇÃO DO RELÓGIO
    const dayNightManager = dayNightManagerRef.current
    if (dayNightManager) {
      dayNightManager.onTimeUpdate = onTimeUpdate
    }

  }, [onSelectTile, onCancelBuild, activeBuild, onTimeUpdate]) // A dependência do onTimeUpdate também foi adicionada aqui

  // --- EFEITO 3: SINCRONIZAÇÃO DA CENA ---
  useEffect(() => {
    if (!appRef.current || !assetsReady) return
    
    const app = appRef.current
    const ghostManager = ghostManagerRef.current
    const buildingManager = buildingManagerRef.current
    
    if (!ghostManager || !buildingManager) return

    console.log("🔄 Sincronizando Cena...")

    ghostManager.updateGhost(activeBuild)
    
    const updateGhostColor = () => {
      ghostManager.updateGhostColor(buildings, activeBuild)
    }
    app.on('update', updateGhostColor)

    buildingManager.syncBuildings(buildings)

    const trafficManager = trafficManagerRef.current
    if (trafficManager) {
      trafficManager.updateRoadGraph(buildings)
    }

    const trainManager = trainManagerRef.current
    if (trainManager) {
      trainManager.updateRailGraph(buildings)
    }

    const airplaneManager = airplaneManagerRef.current
    if (airplaneManager) {
      airplaneManager.updateAirports(buildings)
    }

    return () => { 
      app.off('update', updateGhostColor)
    }
  }, [buildings, activeBuild, assetsReady])

  // --- EFEITO 4: Rotação do Fantasma ---
  useEffect(() => {
    const ghostManager = ghostManagerRef.current;
    if (ghostManager) {
      ghostManager.setRotation(buildRotation);
    }
  }, [buildRotation]);

  if (!webglSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold mb-2">WebGL não suportado</h2>
          <p className="text-gray-400 mb-6">{webglError}</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Verifique se o WebGL está habilitado nas configurações do seu navegador</p>
            <p>• Atualize seu navegador para a versão mais recente</p>
            <p>• Tente usar navegadores como Chrome, Firefox, Edge ou Safari</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <canvas 
      ref={canvasRef} 
      className="block w-full h-full outline-none cursor-auto touch-none brightness-110 contrast-125 saturate-110" 
      onContextMenu={(e) => e.preventDefault()}
    />
  )
})

export default CityScene