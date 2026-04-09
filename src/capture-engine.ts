import type { CaptureOptions } from './types';

export class CaptureEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  capture(video: HTMLVideoElement, options: CaptureOptions = {}): string {
    const { quality = 0.92, format = 'image/jpeg' } = options;
    
    this.canvas.width = video.videoWidth;
    this.canvas.height = video.videoHeight;
    this.ctx.drawImage(video, 0, 0);
    
    return this.canvas.toDataURL(format, quality);
  }
}
