export interface FallbackCaptureOptions {
  facingMode?: 'user' | 'environment';
  onCapture?: (imageData: string) => void;
}

export class FallbackCapture {
  private input?: HTMLInputElement;

  createFallbackInput(options: FallbackCaptureOptions = {}): HTMLInputElement {
    if (this.input) {
      return this.input;
    }

    this.input = document.createElement('input');
    this.input.type = 'file';
    this.input.accept = 'image/*';
    this.input.capture = options.facingMode === 'environment' ? 'environment' : 'user';
    this.input.style.display = 'none';

    this.input.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && options.onCapture) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = event.target?.result as string;
          options.onCapture?.(imageData);
        };
        reader.readAsDataURL(file);
      }
    });

    return this.input;
  }

  trigger(): void {
    if (!this.input) {
      throw new Error('Fallback input not created. Call createFallbackInput() first.');
    }
    this.input.click();
  }

  cleanup(): void {
    if (this.input) {
      this.input.remove();
      this.input = undefined;
    }
  }
}
