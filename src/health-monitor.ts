export class HealthMonitor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private checkInterval?: number;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  startMonitoring(video: HTMLVideoElement, onUnhealthy: () => void): void {
    this.checkInterval = window.setInterval(() => {
      if (!this.isHealthy(video)) {
        onUnhealthy();
      }
    }, 2000);
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  private isHealthy(video: HTMLVideoElement): boolean {
    if (video.readyState < 2) return false;
    
    this.canvas.width = video.videoWidth;
    this.canvas.height = video.videoHeight;
    this.ctx.drawImage(video, 0, 0);
    
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const pixels = imageData.data;
    
    let sum = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      sum += pixels[i] + pixels[i + 1] + pixels[i + 2];
    }
    
    const avg = sum / (pixels.length / 4) / 3;
    return avg > 5;
  }
}
