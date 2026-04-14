# 📸 Camzzler

Lightweight, native-feeling camera library for web and mobile WebViews. Built for selfies, document scanning, and photo capture with a focus on simplicity and reliability.

[![npm version](https://img.shields.io/npm/v/camzzler.svg)](https://www.npmjs.com/package/camzzler)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/camzzler)](https://bundlephobia.com/package/camzzler)

## ✨ Features

- 📱 **Native Mobile Feel** - iOS/Android-style full-screen camera UI
- 🎯 **Zero Dependencies** - Pure TypeScript, no external deps
- 🪶 **Tiny Bundle** - ~17KB minified
- 🔄 **Front/Back Camera** - Easy switching with auto-detection
- 🖼️ **Preview & Confirm** - Built-in photo review flow
- 🛡️ **WebView Compatible** - Works in React Native, Cordova, Capacitor
- 🔒 **Privacy First** - No telemetry, no network calls, no data storage
- ⚡ **Auto-restart** - Detects and fixes black screen issues
- 🎨 **Customizable** - Headless or with built-in UI

## 📦 Installation

```bash
npm install camzzler
```

## 🚀 Quick Start

### Full-Screen Camera (Recommended)

```typescript
import { CamzzlerUI } from 'camzzler';

const camera = new CamzzlerUI({
  fullScreen: true,
  showSwitchButton: true,
  onConfirm: (imageData) => {
    // User confirmed the photo
    console.log('Photo captured:', imageData);
    // Upload to server, save locally, etc.
  },
  onClose: () => {
    console.log('Camera closed');
  }
});

// Start camera
camera.start();
```

### Embedded Camera

```typescript
import { CamzzlerUI } from 'camzzler';

const camera = new CamzzlerUI({
  container: '#camera-container',
  onConfirm: (imageData) => {
    console.log('Photo captured:', imageData);
  }
});

camera.start();
```

### Headless (Custom UI)

```typescript
import { Camzzler } from 'camzzler';

const cam = new Camzzler({
  preferFrontCamera: true,
  mirrorVideo: true
});

// Start camera
const video = await cam.startCamera();
document.body.appendChild(video);

// Capture photo
const imageData = cam.capture({
  quality: 0.92,
  format: 'image/jpeg'
});

// Stop camera
cam.stopCamera();
```

## 📖 API Reference

### CamzzlerUI (With Built-in UI)

```typescript
new CamzzlerUI(options: CamzzlerUIOptions)
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fullScreen` | `boolean` | `false` | Full-screen modal (like native apps) |
| `container` | `string \| HTMLElement` | - | Container selector (required if not fullScreen) |
| `showSwitchButton` | `boolean` | `false` | Show front/back camera toggle |
| `showCaptureButton` | `boolean` | `true` | Show capture button |
| `showCloseButton` | `boolean` | `true` | Show close button (fullScreen only) |
| `showPreview` | `boolean` | `true` | Show preview after capture |
| `preferFrontCamera` | `boolean` | `true` | Start with front camera |
| `mirrorVideo` | `boolean` | `true` | Mirror front camera video |
| `theme` | `'light' \| 'dark'` | `'dark'` | UI theme |
| `onCapture` | `(imageData: string) => void` | - | Called when photo is taken |
| `onConfirm` | `(imageData: string) => void` | - | Called when user confirms photo |
| `onRetake` | `() => void` | - | Called when user retakes photo |
| `onClose` | `() => void` | - | Called when camera is closed |
| `onLoading` | `() => void` | - | Called when camera is loading |
| `onReady` | `() => void` | - | Called when camera is ready |
| `onError` | `(error: CameraError) => void` | - | Called on error |

#### Methods

- `start(): Promise<void>` - Start camera
- `stop(): void` - Stop camera
- `capture(options?): string` - Capture photo
- `switchCamera(): Promise<void>` - Switch front/back
- `cleanup(): void` - Clean up resources

### Camzzler (Headless)

```typescript
new Camzzler(options: CamzzlerOptions)
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `videoElement` | `HTMLVideoElement` | - | Use existing video element |
| `preferFrontCamera` | `boolean` | `true` | Start with front camera |
| `mirrorVideo` | `boolean` | `true` | Mirror front camera video |
| `onHealthCheck` | `(isHealthy: boolean) => void` | - | Health monitoring callback |
| `onLoading` | `() => void` | - | Loading callback |
| `onReady` | `() => void` | - | Ready callback |
| `onError` | `(error: CameraError) => void` | - | Error callback |

#### Methods

- `startCamera(): Promise<HTMLVideoElement>` - Start camera
- `stopCamera(): void` - Stop camera
- `capture(options?): string` - Capture photo as data URL
- `switchCamera(): Promise<void>` - Switch front/back
- `getVideoElement(): HTMLVideoElement` - Get video element
- `isActive(): boolean` - Check if camera is active
- `cleanup(): void` - Clean up resources

### Capture Options

```typescript
{
  quality?: number;              // 0-1, default: 0.92
  format?: 'image/jpeg' | 'image/png' | 'image/webp';  // default: 'image/jpeg'
  maintainAspectRatio?: boolean; // default: true
}
```

## 🎯 Use Cases

### Selfie App
```typescript
const camera = new CamzzlerUI({
  fullScreen: true,
  preferFrontCamera: true,
  mirrorVideo: true,
  onConfirm: (photo) => uploadSelfie(photo)
});
```

### Document Scanner
```typescript
const camera = new CamzzlerUI({
  fullScreen: true,
  preferFrontCamera: false, // Use back camera
  showSwitchButton: true,
  onConfirm: (photo) => processDocument(photo)
});
```

### Profile Photo Upload
```typescript
const camera = new CamzzlerUI({
  container: '#profile-photo',
  onConfirm: (photo) => updateProfile(photo)
});
```

## 🌐 Browser Support

- ✅ Chrome 53+
- ✅ Firefox 36+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ iOS Safari 11+
- ✅ Android Chrome 53+
- ❌ IE 11 (no WebRTC support)

## 📱 WebView Support

Works in:
- React Native WebView
- Cordova/PhoneGap
- Capacitor
- Ionic
- Electron

**Note:** Camera requires HTTPS or `localhost`. For mobile testing, use ngrok or similar tunneling service.

## 🔒 Security & Privacy

- No telemetry or analytics
- No network calls
- No image storage
- Camera auto-stops on page unload
- HTTPS enforcement (except localhost)

## 🐛 Common Issues

### Camera not working
- ✅ Use HTTPS (or localhost for development)
- ✅ Check browser camera permissions
- ✅ Ensure camera is not in use by another app

### Black screen
- ✅ Built-in health monitor auto-restarts camera
- ✅ Try switching cameras
- ✅ Check WebView camera permissions

### Permission denied
- ✅ User must allow camera access
- ✅ Check system camera permissions
- ✅ Reload page and try again

## 📄 License

MIT

## 🤝 Contributing

Issues and PRs welcome!


## 🔗 Links

- GitHub: [Camzzler Repository](https://github.com/rahulkeswani0101/camzzler)
- NPM: [View on npm](https://www.npmjs.com/package/camzzler)
- Issues: [Report a bug](https://github.com/rahulkeswani0101/camzzler/issues)
