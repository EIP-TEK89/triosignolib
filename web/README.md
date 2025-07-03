# TrioSigno-Lib-Web

Web implementation of TrioSigno sign language recognition library for React applications. This package provides web-specific implementations for sign language recognition based on the core library.

## Installation

```bash
npm install triosigno-lib-web
```

## Usage

```typescript
import { OnnxRunnerWeb, MediapipeRunnerWeb } from 'triosigno-lib-web';

// Initialize the ONNX runner for web
const onnxRunner = new OnnxRunnerWeb('/path/to/model.onnx');
await onnxRunner.init();

// Process sign language gestures
// ...
```

## Features

- Web-specific implementation of ONNX runner
- MediaPipe runner for web browsers
- Integration with React web applications

## Dependencies

- triosigno-lib-core
- onnxruntime-web

## Peer Dependencies

- react
- react-dom

## Vite Configuration

If you're using Vite and encounter WASM-related issues, add this to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['onnxruntime-web'], // Ensures proper handling of WASM
  },
});
```

## License

MIT
