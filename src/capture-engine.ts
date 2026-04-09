import type { CaptureOptions } from './types';

export class CaptureEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { 
      alpha: false,
      willReadFrequently: false 
    })!;
  }

  capture(video: HTMLVideoElement, options: CaptureOptions = {}): string {
    const { 
      quality = 0.92, 
      format = 'image/jpeg',
      maintainAspectRatio = true 
    } = options;
    
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (maintainAspectRatio) {
      this.canvas.width = videoWidth;
      this.canvas.height = videoHeight;
    } else {
      // Use current canvas size if already set
      if (this.canvas.width === 0) {
        this.canvas.width = videoWidth;
        this.canvas.height = videoHeight;
      }
    }

    // Clear canvas before drawing
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Handle mirrored video (front camera)
    const isFlipped = video.style.transform.includes('scaleX(-1)');
    if (isFlipped) {
      this.ctx.save();
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(video, -this.canvas.width, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    } else {
      this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
    }
    
    return this.canvas.toDataURL(format, quality);
  }

  cleanup(): void {
    // Clear canvas to free memory
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.width = 0;
    this.canvas.height = 0;
  }
}
