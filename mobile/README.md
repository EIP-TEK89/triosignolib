# TrioSigno-Lib-Mobile

Mobile implementation of TrioSigno sign language recognition library for React Native applications. This package provides mobile-specific implementations for sign language recognition based on the core library.

## Installation

```bash
npm install triosigno-lib-mobile
```

## Usage

```typescript
import { OnnxRunnerMobile, MediapipeRunnerMobile } from "triosigno-lib-mobile";

// Initialize the ONNX runner for mobile
const onnxRunner = new OnnxRunnerMobile("/path/to/model.onnx");
await onnxRunner.init();

// Process sign language gestures
// ...
```

## Features

- Mobile-specific implementation of ONNX runner
- MediaPipe runner for React Native
- TensorFlow Lite integration
- Vision Camera integration

## Dependencies

- triosigno-lib-core
- onnxruntime-react-native
- react-native-fast-tflite
- react-native-fs
- react-native-vision-camera
- vision-camera-resize-plugin

## Peer Dependencies

- react
- react-native

## Included Assets

- Hand detector model (TFLite)
- Hand landmarks detector model (TFLite)

## License

MIT
