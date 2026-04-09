export interface CamzzlerOptions {
  videoElement?: HTMLVideoElement;
  preferFrontCamera?: boolean;
  onHealthCheck?: (isHealthy: boolean) => void;
  onLoading?: () => void;
  onReady?: () => void;
  onError?: (error: CameraError) => void;
  mirrorVideo?: boolean; // Auto-mirror front camera
}

export interface CaptureOptions {
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  maintainAspectRatio?: boolean;
}

export interface CameraDevice {
  deviceId: string;
  label: string;
  isFront: boolean;
}

export type CameraErrorType = 
  | 'permission-denied'
  | 'device-not-found'
  | 'not-supported'
  | 'not-readable'
  | 'overconstrained'
  | 'unknown';

export interface CameraError {
  type: CameraErrorType;
  message: string;
  originalError?: Error;
}
