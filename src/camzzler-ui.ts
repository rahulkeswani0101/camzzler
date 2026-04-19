import { Camzzler } from './camzzler';
import type { CamzzlerOptions, CaptureOptions } from './types';

export interface CamzzlerUIOptions extends CamzzlerOptions {
  container?: HTMLElement | string; // Optional when fullScreen is true
  showControls?: boolean;
  showSwitchButton?: boolean;
  showCaptureButton?: boolean;
  showPreview?: boolean; // Preview before confirm
  showRetakeButton?: boolean; // Retake option
  fullScreen?: boolean; // Full-screen modal
  showCloseButton?: boolean; // Close button for full-screen
  onCapture?: (imageData: string) => void;
  onConfirm?: (imageData: string) => void; // After preview confirm
  onRetake?: () => void;
  onClose?: () => void; // When user closes full-screen
  captureButtonText?: string;
  switchButtonIcon?: string;
  confirmButtonText?: string;
  retakeButtonText?: string;
  theme?: 'light' | 'dark';
  aspectRatio?: '1:1' | '4:3' | '16:9' | 'free';
}

export class CamzzlerUI {
  private camzzler: Camzzler;
  private container: HTMLElement;
  private videoContainer: HTMLDivElement;
  private controlsContainer?: HTMLDivElement;
  private switchButton?: HTMLButtonElement;
  private captureButton?: HTMLButtonElement;
  private closeButton?: HTMLButtonElement;
  private previewOverlay?: HTMLDivElement;
  private fullScreenModal?: HTMLDivElement;
  private options: Required<CamzzlerUIOptions>;

  constructor(options: CamzzlerUIOptions) {
    const defaults = {
      showControls: true,
      showSwitchButton: false,
      showCaptureButton: true,
      showPreview: true,
      showCloseButton: true,
      fullScreen: false,
      captureButtonText: '📸 Capture',
      switchButtonIcon: '🔄', // Camera flip icon
      confirmButtonText: '✓ Use Photo',
      retakeButtonText: '✕ Retake',
      theme: 'dark' as const,
      onCapture: () => {},
      onConfirm: () => {},
      onRetake: () => {},
      onClose: () => {}
    };

    this.options = { ...defaults, ...options } as Required<CamzzlerUIOptions>;

    // Get or create container
    if (this.options.fullScreen) {
      // Create full-screen modal
      this.fullScreenModal = this.createFullScreenModal();
      document.body.appendChild(this.fullScreenModal);
      this.container = this.fullScreenModal;
    } else {
      // Use provided container
      if (!options.container) {
        throw new Error('Container is required when fullScreen is false');
      }
      if (typeof options.container === 'string') {
        const el = document.querySelector(options.container);
        if (!el) throw new Error(`Container not found: ${options.container}`);
        this.container = el as HTMLElement;
      } else {
        this.container = options.container;
      }
    }

    // Create UI
    this.videoContainer = this.createVideoContainer();
    this.container.appendChild(this.videoContainer);

    // Add top buttons separately
    this.addTopButtons();

    if (this.options.showControls) {
      this.controlsContainer = this.createControls();
      this.videoContainer.appendChild(this.controlsContainer);
    }

    // Initialize Camzzler
    this.camzzler = new Camzzler({
      ...options,
      onLoading: () => {
        this.setLoading(true);
        options.onLoading?.();
      },
      onReady: () => {
        this.setLoading(false);
        options.onReady?.();
      },
      onError: (error) => {
        this.setLoading(false);
        this.showError(error.message);
        options.onError?.(error);
      }
    });
  }

  private createVideoContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'camzzler-container';
    
    const styles = `
      .camzzler-fullscreen-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #000;
        z-index: 9999;
        display: flex;
        flex-direction: column;
      }

      .camzzler-container {
        position: relative;
        width: 100%;
        height: 100%;
        background: #000;
        overflow: hidden;
      }

      .camzzler-container video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .camzzler-close-btn {
        position: absolute;
        top: 20px;
        left: 20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: rgba(0,0,0,0.4);
        backdrop-filter: blur(10px);
        color: white;
        font-size: 22px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        z-index: 10;
      }

      .camzzler-close-btn:hover {
        background: rgba(0,0,0,0.6);
      }

      .camzzler-close-btn:active {
        transform: scale(0.9);
      }

      .camzzler-controls {
        position: absolute;
        bottom: 40px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10;
      }

      .camzzler-switch-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: rgba(0,0,0,0.4);
        backdrop-filter: blur(10px);
        color: white;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        z-index: 10;
      }

      .camzzler-switch-btn:hover {
        background: rgba(0,0,0,0.6);
      }

      .camzzler-switch-btn:active {
        transform: scale(0.9);
      }

      .camzzler-capture-btn {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 3px solid white;
        background: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
        position: relative;
      }

      .camzzler-capture-btn::after {
        content: '';
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: white;
        position: absolute;
        transition: all 0.15s;
      }

      .camzzler-capture-btn:active::after {
        transform: scale(0.85);
      }

      .camzzler-preview-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #000;
        z-index: 20;
        display: flex;
        flex-direction: column;
      }

      .camzzler-preview-image {
        flex: 1;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .camzzler-preview-actions {
        position: absolute;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 16px;
        align-items: center;
      }

      .camzzler-action-btn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: none;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
      }

      .camzzler-btn-retake {
        background: rgba(255,255,255,0.2);
        color: white;
      }

      .camzzler-btn-retake:active {
        transform: scale(0.9);
        background: rgba(255,255,255,0.3);
      }

      .camzzler-btn-confirm {
        background: white;
        color: #000;
        width: 56px;
        height: 56px;
        font-size: 24px;
      }

      .camzzler-btn-confirm:active {
        transform: scale(0.9);
      }

      .camzzler-loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
      }

      .camzzler-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgba(255,255,255,0.2);
        border-top-color: rgba(255,255,255,0.8);
        border-radius: 50%;
        animation: camzzler-spin 0.8s linear infinite;
      }

      @keyframes camzzler-spin {
        to { transform: rotate(360deg); }
      }

      .camzzler-error {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255,0,0,0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-size: 14px;
        max-width: 80%;
        text-align: center;
        z-index: 10;
      }
    `;

    // Add styles if not already added
    if (!document.getElementById('camzzler-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'camzzler-styles';
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    }

    return container;
  }

  private createControls(): HTMLDivElement {
    const controls = document.createElement('div');
    controls.className = 'camzzler-controls';

    if (this.options.showCaptureButton) {
      this.captureButton = document.createElement('button');
      this.captureButton.className = 'camzzler-capture-btn';
      this.captureButton.title = 'Capture Photo';
      this.captureButton.onclick = () => this.capture();
      controls.appendChild(this.captureButton);
    }

    return controls;
  }

  private addTopButtons(): void {
    if (this.options.fullScreen && this.options.showCloseButton) {
      this.closeButton = document.createElement('button');
      this.closeButton.className = 'camzzler-close-btn';
      this.closeButton.innerHTML = '✕';
      this.closeButton.title = 'Close';
      this.closeButton.onclick = () => this.close();
      this.videoContainer.appendChild(this.closeButton);
    }

    if (this.options.showSwitchButton) {
      this.switchButton = document.createElement('button');
      this.switchButton.className = 'camzzler-switch-btn';
      this.switchButton.innerHTML = this.options.switchButtonIcon;
      this.switchButton.title = 'Switch Camera';
      this.switchButton.onclick = () => this.switchCamera();
      this.videoContainer.appendChild(this.switchButton);
    }
  }

  private createFullScreenModal(): HTMLDivElement {
    const modal = document.createElement('div');
    modal.className = 'camzzler-fullscreen-modal';
    return modal;
  }

  private close(): void {
    this.stop();
    if (this.fullScreenModal) {
      this.fullScreenModal.remove();
    }
    this.options.onClose();
  }

  private setLoading(loading: boolean): void {
    const existing = this.videoContainer.querySelector('.camzzler-loading');
    if (existing) existing.remove();

    if (loading) {
      const loader = document.createElement('div');
      loader.className = 'camzzler-loading';
      loader.innerHTML = '<div class="camzzler-spinner"></div>';
      this.videoContainer.appendChild(loader);
    }
  }

  private showError(message: string): void {
    const existing = this.videoContainer.querySelector('.camzzler-error');
    if (existing) existing.remove();

    const error = document.createElement('div');
    error.className = 'camzzler-error';
    error.textContent = message;
    this.videoContainer.appendChild(error);

    setTimeout(() => error.remove(), 5000);
  }

  async start(): Promise<void> {
    const video = await this.camzzler.startCamera();
    this.videoContainer.insertBefore(video, this.videoContainer.firstChild);
  }

  stop(): void {
    this.camzzler.stopCamera();
  }

  capture(options?: CaptureOptions): string {
    const imageData = this.camzzler.capture(options);
    this.options.onCapture(imageData);
    
    if (this.options.showPreview) {
      this.showPreview(imageData);
    }
    
    return imageData;
  }

  private showPreview(imageData: string): void {
    // Stop camera
    this.camzzler.stopCamera();
    
    // Hide controls
    if (this.controlsContainer) {
      this.controlsContainer.style.display = 'none';
    }
    
    // Create preview overlay
    this.previewOverlay = document.createElement('div');
    this.previewOverlay.className = 'camzzler-preview-overlay';
    
    const img = document.createElement('img');
    img.className = 'camzzler-preview-image';
    img.src = imageData;
    
    const actions = document.createElement('div');
    actions.className = 'camzzler-preview-actions';
    
    const retakeBtn = document.createElement('button');
    retakeBtn.className = 'camzzler-action-btn camzzler-btn-retake';
    retakeBtn.innerHTML = '✕';
    retakeBtn.title = 'Retake';
    retakeBtn.onclick = () => this.retake();
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'camzzler-action-btn camzzler-btn-confirm';
    confirmBtn.innerHTML = '✓';
    confirmBtn.title = 'Use Photo';
    confirmBtn.onclick = () => this.confirm(imageData);
    
    actions.appendChild(retakeBtn);
    actions.appendChild(confirmBtn);
    
    this.previewOverlay.appendChild(img);
    this.previewOverlay.appendChild(actions);
    this.videoContainer.appendChild(this.previewOverlay);
  }

  private async retake(): Promise<void> {
    if (this.previewOverlay) {
      this.previewOverlay.remove();
      this.previewOverlay = undefined;
    }
    
    if (this.controlsContainer) {
      this.controlsContainer.style.display = 'flex';
    }
    
    this.options.onRetake();
    await this.start();
  }

  private confirm(imageData: string): void {
    this.options.onConfirm(imageData);
  }

  async switchCamera(): Promise<void> {
    await this.camzzler.switchCamera();
  }

  cleanup(): void {
    this.camzzler.cleanup();
    if (this.fullScreenModal) {
      this.fullScreenModal.remove();
    } else {
      this.container.innerHTML = '';
    }
  }

  getCamzzler(): Camzzler {
    return this.camzzler;
  }
}
