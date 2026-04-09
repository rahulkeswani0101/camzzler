import { CameraEngine } from './camera-engine';
import { CaptureEngine } from './capture-engine';
import type { CamzzlerOptions, CaptureOptions } from './types';

export class Camzzler {
  private cameraEngine: CameraEngine;
  private captureEngine: CaptureEngine;

  constructor(options: CamzzlerOptions = {}) {
    this.cameraEngine = new CameraEngine(options);
    this.captureEngine = new CaptureEngine();
  }

  async startCamera(): Promise<HTMLVideoElement> {
    return await this.cameraEngine.start();
  }

  stopCamera(): void {
    this.cameraEngine.stop();
  }

  capture(options?: CaptureOptions): string {
    const video = this.cameraEngine.getVideo();
    return this.captureEngine.capture(video, options);
  }

  getVideoElement(): HTMLVideoElement {
    return this.cameraEngine.getVideo();
  }
}

export * from './types';
export { CameraEngine } from './camera-engine';
export { CaptureEngine } from './capture-engine';
export { DeviceManager } from './device-manager';
export { HealthMonitor } from './health-monitor';
