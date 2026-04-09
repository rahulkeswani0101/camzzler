import { DeviceManager } from './device-manager';
import { HealthMonitor } from './health-monitor';
import type { CamzzlerOptions } from './types';

export class CameraEngine {
  private stream?: MediaStream;
  private video: HTMLVideoElement;
  private deviceManager: DeviceManager;
  private healthMonitor: HealthMonitor;
  private options: CamzzlerOptions;

  constructor(options: CamzzlerOptions = {}) {
    this.options = options;
    this.video = options.videoElement || document.createElement('video');
    this.video.autoplay = true;
    this.video.playsInline = true;
    this.deviceManager = new DeviceManager();
    this.healthMonitor = new HealthMonitor();
  }

  async start(): Promise<HTMLVideoElement> {
    const constraints = await this.getConstraints();
    
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      
      await new Promise((resolve) => {
        this.video.onloadedmetadata = resolve;
      });
      
      if (this.options.onHealthCheck) {
        this.healthMonitor.startMonitoring(this.video, () => {
          this.options.onHealthCheck?.(false);
          this.restart();
        });
      }
      
      return this.video;
    } catch (error) {
      throw new Error(`Camera access failed: ${error}`);
    }
  }

  stop(): void {
    this.healthMonitor.stopMonitoring();
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = undefined;
    }
    
    this.video.srcObject = null;
  }

  private async restart(): Promise<void> {
    this.stop();
    await this.start();
  }

  private async getConstraints(): Promise<MediaStreamConstraints> {
    const constraints: MediaStreamConstraints = {
      video: { facingMode: 'user' },
      audio: false
    };

    if (this.options.preferFrontCamera !== false) {
      const frontCameraId = await this.deviceManager.getFrontCamera();
      if (frontCameraId) {
        constraints.video = { deviceId: { exact: frontCameraId } };
      }
    }

    return constraints;
  }

  getVideo(): HTMLVideoElement {
    return this.video;
  }
}
