import { DeviceManager } from './device-manager';
import { HealthMonitor } from './health-monitor';
import type { CamzzlerOptions, CameraError, CameraErrorType } from './types';

export class CameraEngine {
  private stream?: MediaStream;
  private video: HTMLVideoElement;
  private deviceManager: DeviceManager;
  private healthMonitor: HealthMonitor;
  private options: CamzzlerOptions;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private currentFacingMode: 'user' | 'environment';

  constructor(options: CamzzlerOptions = {}) {
    this.options = {
      mirrorVideo: true, // Default mirror for front camera
      ...options
    };
    this.currentFacingMode = this.options.preferFrontCamera !== false ? 'user' : 'environment';
    this.video = options.videoElement || document.createElement('video');
    this.video.autoplay = true;
    this.video.playsInline = true;
    this.video.muted = true;
    this.video.setAttribute('playsinline', 'true');
    this.video.setAttribute('webkit-playsinline', 'true');
    
    // Apply mirror effect for front camera
    this.updateMirrorEffect();
    
    this.deviceManager = new DeviceManager();
    this.healthMonitor = new HealthMonitor();
  }

  async start(): Promise<HTMLVideoElement> {
    this.options.onLoading?.();
    
    try {
      const constraints = await this.getConstraints();
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      
      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video load timeout'));
        }, 10000);

        this.video.onloadedmetadata = () => {
          clearTimeout(timeout);
          resolve();
        };
      });

      // Ensure video is playing
      try {
        await this.video.play();
      } catch (playError) {
        console.warn('Autoplay failed, video may need user interaction:', playError);
      }
      
      // Start health monitoring
      if (this.options.onHealthCheck) {
        this.healthMonitor.startMonitoring(this.video, () => {
          this.options.onHealthCheck?.(false);
          this.restart();
        });
      }
      
      this.retryCount = 0;
      this.options.onReady?.();
      return this.video;
    } catch (error) {
      const cameraError = this.parseCameraError(error);
      this.options.onError?.(cameraError);
      
      // Retry with fallback constraints for certain errors
      if (this.shouldRetry(cameraError) && this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.warn(`Camera start failed, retry ${this.retryCount}/${this.maxRetries}`, error);
        return this.startWithFallbackConstraints();
      }
      
      throw cameraError;
    }
  }

  private parseCameraError(error: any): CameraError {
    let type: CameraErrorType = 'unknown';
    let message = 'Camera access failed';

    if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
      type = 'permission-denied';
      message = 'Camera permission denied. Please allow camera access in your browser settings.';
    } else if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
      type = 'device-not-found';
      message = 'No camera found on this device.';
    } else if (error?.name === 'NotSupportedError') {
      type = 'not-supported';
      message = 'Camera not supported. Please use HTTPS or a supported browser.';
    } else if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') {
      type = 'not-readable';
      message = 'Camera is already in use by another application.';
    } else if (error?.name === 'OverconstrainedError' || error?.name === 'ConstraintNotSatisfiedError') {
      type = 'overconstrained';
      message = 'Camera constraints not satisfied. Trying with basic settings...';
    }

    return {
      type,
      message,
      originalError: error
    };
  }

  private shouldRetry(error: CameraError): boolean {
    // Don't retry for permission denied or device not found
    return error.type !== 'permission-denied' && error.type !== 'device-not-found';
  }

  private async startWithFallbackConstraints(): Promise<HTMLVideoElement> {
    try {
      const basicConstraints: MediaStreamConstraints = {
        video: { 
          facingMode: this.currentFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      this.video.srcObject = this.stream;
      
      await new Promise<void>((resolve) => {
        this.video.onloadedmetadata = () => resolve();
      });

      await this.video.play().catch(() => {});
      
      this.retryCount = 0;
      this.options.onReady?.();
      return this.video;
    } catch (error) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        return this.startWithFallbackConstraints();
      }
      throw this.parseCameraError(error);
    }
  }

  stop(): void {
    this.healthMonitor.stopMonitoring();
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = undefined;
    }
    
    this.video.srcObject = null;
    this.video.pause();
  }

  private async restart(): Promise<void> {
    this.stop();
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.start();
  }

  private async getConstraints(): Promise<MediaStreamConstraints> {
    const constraints: MediaStreamConstraints = {
      video: { 
        facingMode: this.currentFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    if (this.currentFacingMode === 'user') {
      try {
        const frontCameraId = await this.deviceManager.getFrontCamera();
        if (frontCameraId) {
          constraints.video = { 
            deviceId: { exact: frontCameraId },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          };
        }
      } catch (error) {
        console.warn('Device enumeration failed, using facingMode:', error);
      }
    }

    return constraints;
  }

  async switchCamera(): Promise<void> {
    this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
    this.updateMirrorEffect();
    await this.restart();
  }

  private updateMirrorEffect(): void {
    if (this.options.mirrorVideo && this.currentFacingMode === 'user') {
      this.video.style.transform = 'scaleX(-1)';
    } else {
      this.video.style.transform = 'none';
    }
  }

  getVideo(): HTMLVideoElement {
    return this.video;
  }

  isActive(): boolean {
    return !!this.stream && this.stream.active;
  }

  getCurrentFacingMode(): 'user' | 'environment' {
    return this.currentFacingMode;
  }
}
