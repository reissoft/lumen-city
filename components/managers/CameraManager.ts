// managers/CameraManager.ts - Gerencia câmera e controles
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

  // Raycasting
  private ray = new pc.Ray();
  private hitPosition = new pc.Vec3();
  private rayStart = new pc.Vec3();
  private rayEnd = new pc.Vec3();

  // Callbacks
  private onSelectTile?: (x: number, y: number) => void;
  private onCancelBuild?: () => void;
  private getActiveBuild?: () => string | null;

  constructor(
    app: pc.Application,
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

    // Criar entidades
    this.pivot = this.createPivot();
    this.camera = this.createCamera();
    this.cursor = this.createCursor();

    this.setupInputHandlers();
  }

  private createPivot(): pc.Entity {
    const pivot = new pc.Entity('CameraPivot');
    pivot.setEulerAngles(this.currentPitch, this.currentYaw, 0);
    this.app.root.addChild(pivot);
    return pivot;
  }

  private createCamera(): pc.Entity {
    const camera = new pc.Entity('Camera');
    camera.addComponent('camera', {
      clearColor: new pc.Color(
        CAMERA_CONFIG.clearColor.r,
        CAMERA_CONFIG.clearColor.g,
        CAMERA_CONFIG.clearColor.b
      ),
      projection: pc.PROJECTION_ORTHOGRAPHIC,
      orthoHeight: CAMERA_CONFIG.orthoHeight,
      farClip: CAMERA_CONFIG.farClip,
    });

    camera.setPosition(
      CAMERA_CONFIG.position.x,
      CAMERA_CONFIG.position.y,
      CAMERA_CONFIG.position.z
    );
    camera.lookAt(
      CAMERA_CONFIG.lookAt.x,
      CAMERA_CONFIG.lookAt.y,
      CAMERA_CONFIG.lookAt.z
    );

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
    if (!this.app.mouse) return;

    // Zoom
    this.app.mouse.on(pc.EVENT_MOUSEWHEEL, (event: any) => {
      this.targetZoom -= event.wheel * 5;
      this.targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.targetZoom));
    });

    // Mouse down
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, (event: any) => {
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
    });

    // Mouse up
    this.app.mouse.on(pc.EVENT_MOUSEUP, (event: any) => {
      if (event.button === pc.MOUSEBUTTON_LEFT) {
        this.isPanning = false;
        const dist = Math.hypot(event.x - this.clickStartX, event.y - this.clickStartY);
        if (dist < 5 && this.cursor.enabled && this.onSelectTile) {
          const gridX = (this.cursor.getPosition().x + OFFSET) / 2;
          const gridY = (this.cursor.getPosition().z + OFFSET) / 2;
          this.onSelectTile(gridX, gridY);
        }
      } else if (event.button === pc.MOUSEBUTTON_RIGHT) {
        this.isRotating = false;
      }
    });

    // Mouse move
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, (event: any) => {
      if (this.isRotating) {
        this.currentPitch -= event.dy * 0.3;
        this.currentYaw -= event.dx * 0.3;
        this.currentPitch = Math.max(-10, Math.min(60, this.currentPitch));
        this.pivot.setEulerAngles(this.currentPitch, this.currentYaw, 0);
      }

      if (this.isPanning) {
        const zoomFactor = this.camera.camera!.orthoHeight / 20;
        this.pivot.translateLocal(
          -event.dx * 0.05 * zoomFactor,
          0,
          event.dy * -0.05 * zoomFactor
        );
      }

      if (this.camera.camera && !this.isRotating) {
        this.updateCursorPosition(event.x, event.y);
      }
    });
  }

  private updateCursorPosition(mouseX: number, mouseY: number): void {
    if (!this.camera.camera) return;

    this.camera.camera.screenToWorld(
      mouseX,
      mouseY,
      this.camera.camera.nearClip,
      this.rayStart
    );
    this.camera.camera.screenToWorld(
      mouseX,
      mouseY,
      this.camera.camera.farClip,
      this.rayEnd
    );

    this.ray.origin.copy(this.rayStart);
    this.ray.direction.copy(this.rayEnd).sub(this.rayStart).normalize();

    if (Math.abs(this.ray.direction.y) > 0.0001) {
      const t = -this.ray.origin.y / this.ray.direction.y;
      if (t > 0) {
        this.hitPosition.copy(this.ray.origin).add(this.ray.direction.mulScalar(t));
        const snapX = Math.round(this.hitPosition.x / 2) * 2;
        const snapZ = Math.round(this.hitPosition.z / 2) * 2;

        if (
          snapX >= -OFFSET &&
          snapX <= OFFSET &&
          snapZ >= -OFFSET &&
          snapZ <= OFFSET
        ) {
          this.cursor.enabled = true;
          this.cursor.setPosition(snapX, 0, snapZ);
        } else {
          this.cursor.enabled = false;
        }
      }
    }
  }

  /**
   * Atualiza a câmera (chamado no loop de update)
   */
  update(dt: number): void {
    if (this.camera.camera) {
      this.camera.camera.orthoHeight = pc.math.lerp(
        this.camera.camera.orthoHeight,
        this.targetZoom,
        dt * 10
      );
    }
  }

  /**
   * Retorna a entidade do cursor
   */
  getCursor(): pc.Entity {
    return this.cursor;
  }

  /**
   * Retorna a entidade da câmera
   */
  getCamera(): pc.Entity {
    return this.camera;
  }
}
