import * as pc from 'playcanvas';
import {
  CAMERA_CONFIG,
  MIN_ZOOM,
  MAX_ZOOM,
  INITIAL_ZOOM,
  INITIAL_PITCH,
  INITIAL_YAW,
  OFFSET,
} from '../constants';

declare global {
  interface Window {
    isPointerOverUI: boolean;
  }
}

export class CameraManager {
  private app: pc.Application;
  private pivot: pc.Entity;
  private camera: pc.Entity;
  private cursor: pc.Entity;

  // Estado de controles
  private targetZoom = INITIAL_ZOOM;
  private currentPitch = INITIAL_PITCH;
  private currentYaw = INITIAL_YAW;
  private isPanning = false;
  private isRotating = false;
  private clickStartX = 0;
  private clickStartY = 0;

  // Estado de Toque
  private lastTouchPoint = new pc.Vec2();
  private lastPinchDistance = 0;

  // Raycasting
  private ray = new pc.Ray();
  private hitPosition = new pc.Vec3();
  private rayStart = new pc.Vec3();
  private rayEnd = new pc.Vec3();

  public onSelectTile?: (x: number, y: number) => void;
  public onCancelBuild?: () => void;
  public getActiveBuild?: () => string | null;

  constructor(
    app: pc.Application,
    cursorEntity?: pc.Entity,
    callbacks?: {
      onSelectTile?: (x: number, y: number) => void;
      onCancelBuild?: () => void;
      getActiveBuild?: () => string | null;
    }
  ) {
    this.app = app;
    this.onSelectTile = callbacks?.onSelectTile;
    this.onCancelBuild = callbacks?.onCancelBuild;
    this.getActiveBuild = callbacks?.getActiveBuild;

    window.isPointerOverUI = false;

    this.pivot = this.createPivot();
    this.camera = this.createCamera();
    this.cursor = cursorEntity || this.createCursor();

    this.setupInputHandlers();
  }

  // --- Métodos de ciclo de vida e configuração ---

  private createPivot(): pc.Entity {
    const pivot = new pc.Entity('CameraPivot');
    pivot.setEulerAngles(this.currentPitch, this.currentYaw, 0);
    this.app.root.addChild(pivot);
    return pivot;
  }

  private createCamera(): pc.Entity {
    const camera = new pc.Entity('Camera');
    camera.addComponent('camera', {
      clearColor: new pc.Color(CAMERA_CONFIG.clearColor.r, CAMERA_CONFIG.clearColor.g, CAMERA_CONFIG.clearColor.b),
      projection: pc.PROJECTION_ORTHOGRAPHIC,
      orthoHeight: CAMERA_CONFIG.orthoHeight,
      farClip: CAMERA_CONFIG.farClip,
    });
    camera.setPosition(CAMERA_CONFIG.position.x, CAMERA_CONFIG.position.y, CAMERA_CONFIG.position.z);
    camera.lookAt(CAMERA_CONFIG.lookAt.x, CAMERA_CONFIG.lookAt.y, CAMERA_CONFIG.lookAt.z);
    this.pivot.addChild(camera);
    return camera;
  }

  private createCursor(): pc.Entity {
    const cursor = new pc.Entity('Cursor');
    cursor.setPosition(0, 0, 0);
    this.app.root.addChild(cursor);
    return cursor;
  }

  private setupInputHandlers(): void {
    // Mouse
    if (this.app.mouse) {
      this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
      this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
      this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
      this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    }
    // Touch
    if (this.app.touch) {
      this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
      this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
      this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
    }
  }

  public destroy(): void {
    // Mouse
    if (this.app.mouse) {
        this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
        this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    }
    // Touch
    if (this.app.touch) {
        this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.off(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
    }
  }

  // --- Handlers de Mouse (Refatorados) ---

  private onMouseWheel(event: pc.MouseEvent & { wheel: number }): void {
      if (window.isPointerOverUI) return;
      this.targetZoom -= event.wheel * 5;
      this.targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.targetZoom));
  }

  private onMouseDown(event: pc.MouseEvent): void {
    if (window.isPointerOverUI) return;
    if (event.button === pc.MOUSEBUTTON_LEFT) {
      this.isPanning = true;
      this.clickStartX = event.x;
      this.clickStartY = event.y;
    } else if (event.button === pc.MOUSEBUTTON_RIGHT) {
      const activeBuild = this.getActiveBuild?.();
      if (activeBuild) {
        this.onCancelBuild?.();
        return;
      }
      this.isRotating = true;
    }
  }

  private onMouseUp(event: pc.MouseEvent): void {
    if (window.isPointerOverUI) return;
    if (event.button === pc.MOUSEBUTTON_LEFT) {
      this.isPanning = false;
      const dist = Math.hypot(event.x - this.clickStartX, event.y - this.clickStartY);
      if (dist >= 5) return;
      if (!this.cursor.enabled) return;
      if (!this.onSelectTile) return;
      const cursorPos = this.cursor.getPosition();
      const gridX = (cursorPos.x + OFFSET) / 2;
      const gridY = (cursorPos.z + OFFSET) / 2;
      this.onSelectTile(gridX, gridY);
    } else if (event.button === pc.MOUSEBUTTON_RIGHT) {
      this.isRotating = false;
    }
  }

  private onMouseMove(event: pc.MouseEvent): void {
    if (this.isRotating) {
      this.currentPitch -= event.dy * 0.3;
      this.currentYaw -= event.dx * 0.3;
      this.currentPitch = Math.max(-10, Math.min(60, this.currentPitch));
      this.pivot.setEulerAngles(this.currentPitch, this.currentYaw, 0);
    }
    if (this.isPanning) {
      const zoomFactor = this.camera.camera!.orthoHeight / 20;
      this.pivot.translateLocal(-event.dx * 0.05 * zoomFactor, 0, event.dy * -0.05 * zoomFactor);
    }
    if (this.camera.camera && !this.isRotating) {
      this.updateCursorPosition(event.x, event.y);
    }
  }

  // --- Handlers de Toque (Novos) ---

  private onTouchStart(event: pc.TouchEvent): void {
      if (window.isPointerOverUI) return;
      if (event.touches.length === 1) {
          this.isPanning = true;
          this.lastTouchPoint.set(event.touches[0].x, event.touches[0].y);
      } else if (event.touches.length === 2) {
          this.isPanning = false; // Para o pan se o segundo dedo tocar a tela
          this.lastPinchDistance = this.getPinchDistance(event.touches);
      }
  }

  private onTouchEnd(event: pc.TouchEvent): void {
      this.isPanning = false;
      this.lastPinchDistance = 0;
  }

  private onTouchMove(event: pc.TouchEvent): void {
      // A verificação de UI foi removida daqui. Ela só é necessária no onTouchStart.
      if (event.touches.length === 1 && this.isPanning) {
          const touch = event.touches[0];
          const dx = touch.x - this.lastTouchPoint.x;
          const dy = touch.y - this.lastTouchPoint.y;
          if (this.camera.camera) {
              const zoomFactor = this.camera.camera.orthoHeight / 20;
              this.pivot.translateLocal(-dx * 0.05 * zoomFactor, 0, -dy * 0.05 * zoomFactor);
          }
          this.lastTouchPoint.set(touch.x, touch.y);
      } else if (event.touches.length === 2) {
          const currentPinchDistance = this.getPinchDistance(event.touches);
          const pinchDelta = currentPinchDistance - this.lastPinchDistance;
          this.targetZoom -= pinchDelta * 0.1; // Sensibilidade do zoom de pinça
          this.targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.targetZoom));
          this.lastPinchDistance = currentPinchDistance;
      }
  }

  private getPinchDistance(touches: pc.Touch[]): number {
      const touch1 = touches[0];
      const touch2 = touches[1];
      const dx = touch1.x - touch2.x;
      const dy = touch1.y - touch2.y;
      return Math.sqrt(dx * dx + dy * dy);
  }

  // --- Métodos de atualização e utilitários ---

  private updateCursorPosition(mouseX: number, mouseY: number): void {
    if (!this.camera.camera) return;
    this.camera.camera.screenToWorld(mouseX, mouseY, this.camera.camera.nearClip, this.rayStart);
    this.camera.camera.screenToWorld(mouseX, mouseY, this.camera.camera.farClip, this.rayEnd);
    this.ray.origin.copy(this.rayStart);
    this.ray.direction.copy(this.rayEnd).sub(this.rayStart).normalize();
    if (Math.abs(this.ray.direction.y) > 0.0001) {
      const t = -this.ray.origin.y / this.ray.direction.y;
      if (t > 0) {
        this.hitPosition.copy(this.ray.origin).add(this.ray.direction.mulScalar(t));
        const snapX = Math.round(this.hitPosition.x / 2) * 2;
        const snapZ = Math.round(this.hitPosition.z / 2) * 2;
        if (snapX >= -OFFSET && snapX <= OFFSET && snapZ >= -OFFSET && snapZ <= OFFSET) {
          this.cursor.enabled = true;
          this.cursor.setPosition(snapX, 0, snapZ);
        } else {
          this.cursor.enabled = false;
        }
      }
    }
  }

  public update(dt: number): void {
    if (this.camera.camera) {
      this.camera.camera.orthoHeight = pc.math.lerp(this.camera.camera.orthoHeight, this.targetZoom, dt * 10);
    }
  }

  public getCursor(): pc.Entity { return this.cursor; }
  public getCamera(): pc.Entity { return this.camera; }
}
