# Camzzler

Lightweight camera abstraction for browsers and mobile WebViews.

## Features

- Minimal bundle size
- Front camera auto-detection
- WebView compatibility (Android/iOS)
- Black screen detection & auto-restart
- Zero external dependencies
- Privacy-first (no telemetry, no network calls)

## Installation

```bash
npm install camzzler
```

## Usage

```typescript
import { Camzzler } from 'camzzler';

const cam = new Camzzler({
  preferFrontCamera: true,
  onHealthCheck: (isHealthy) => {
    console.log('Camera health:', isHealthy);
  }
});

// Start camera
const video = await cam.startCamera();
document.body.appendChild(video);

// Capture image
const imageData = cam.capture({
  quality: 0.92,
  format: 'image/jpeg'
});

// Stop camera
cam.stopCamera();
```

## API

### `new Camzzler(options?)`

Options:
- `videoElement?: HTMLVideoElement` - Use existing video element
- `preferFrontCamera?: boolean` - Auto-select front camera (default: true)
- `onHealthCheck?: (isHealthy: boolean) => void` - Health monitoring callback

### Methods

- `startCamera(): Promise<HTMLVideoElement>` - Initialize and start camera
- `stopCamera(): void` - Stop camera and release resources
- `capture(options?): string` - Capture image as data URL
- `getVideoElement(): HTMLVideoElement` - Get video element

## License

MIT
