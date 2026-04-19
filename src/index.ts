// Import all modules explicitly to ensure they're bundled
import { Camzzler } from './camzzler';
import { CameraEngine } from './camera-engine';
import { CaptureEngine } from './capture-engine';
import { DeviceManager } from './device-manager';
import { HealthMonitor } from './health-monitor';
import { FallbackCapture } from './fallback-capture';
import { CamzzlerUI } from './camzzler-ui';

// Re-export everything
export * from './types';
export { Camzzler, CameraEngine, CaptureEngine, DeviceManager, HealthMonitor, FallbackCapture, CamzzlerUI };
export type { CamzzlerUIOptions } from './camzzler-ui';
