import type { CameraDevice } from './types';

export class DeviceManager {
  async getCameras(): Promise<CameraDevice[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter(d => d.kind === 'videoinput')
      .map(d => ({
        deviceId: d.deviceId,
        label: d.label,
        isFront: d.label.toLowerCase().includes('front') || d.label.toLowerCase().includes('user')
      }));
  }

  async getFrontCamera(): Promise<string | null> {
    const cameras = await this.getCameras();
    const front = cameras.find(c => c.isFront);
    return front?.deviceId || null;
  }
}
