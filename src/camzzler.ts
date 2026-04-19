import { CameraEngine } from './camera-engine';
import { CaptureEngine } from './capture-engine';
import { FallbackCapture } from './fallback-capture';
import type { CamzzlerOptions, CaptureOptions } from './types';

export class Camzzler {
  private cameraEngine: CameraEngine;
  private captureEngine: CaptureEngine;
  private fallbackCapture: FallbackCapture;
  private useFallback: boolean = false;

  constructor(options: CamzzlerOptions = {}) {
    this.cameraEngine = new CameraEngine(options);
    this.captureEngine = new CaptureEngine();
    this.fallbackCapture = new FallbackCapture();
  }

  async startCamera(): Promise<HTMLVideoElement> {
    try {
      return await this.cameraEngine.start();
    } catch (error) {
      console.warn('WebRTC camera failed, use fallback capture:', error);
      this.useFallback = true;
      throw error;
    }
  }

  stopCamera(): void {
    this.cameraEngine.stop();
  }

  capture(options?: CaptureOptions): string {
    if (this.useFallback) {
      throw new Error('Camera not started. Use fallback capture instead.');
    }
    const video = this.cameraEngine.getVideo();
    return this.captureEngine.capture(video, options);
  }

  async switchCamera(): Promise<void> {
    await this.cameraEngine.switchCamera();
  }

  getVideoElement(): HTMLVideoElement {
    return this.cameraEngine.getVideo();
  }

  isActive(): boolean {
    return this.cameraEngine.isActive();
  }

  setupFallbackCapture(onCapture: (imageData: string) => void, facingMode?: 'user' | 'environment'): HTMLInputElement {
    const input = this.fallbackCapture.createFallbackInput({ facingMode, onCapture });
    document.body.appendChild(input);
    return input;
  }

  triggerFallbackCapture(): void {
    this.fallbackCapture.trigger();
  }

  cleanup(): void {
    this.stopCamera();
    this.captureEngine.cleanup();
    this.fallbackCapture.cleanup();
  }
}
