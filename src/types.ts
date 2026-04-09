export interface CamzzlerOptions {
  videoElement?: HTMLVideoElement;
  preferFrontCamera?: boolean;
  onHealthCheck?: (isHealthy: boolean) => void;
}

export interface CaptureOptions {
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface CameraDevice {
  deviceId: string;
  label: string;
  isFront: boolean;
}
