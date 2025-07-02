# TrioSigno Library

This repository contains a collection of packages for sign language recognition:

- **triosigno-lib-core**: Core TypeScript library for sign language recognition
- **triosigno-lib-web**: Web implementation for React applications
- **triosigno-lib-mobile**: Mobile implementation for React Native applications

## Installation

### For Web Applications (React)

```bash
npm install triosigno-lib-core triosigno-lib-web
```

### For Mobile Applications (React Native)

```bash
npm install triosigno-lib-core triosigno-lib-mobile
```

## Usage

### Web

```typescript
import { SignRecognizer } from "triosigno-lib-core";
import { OnnxRunnerWeb } from "triosigno-lib-web";

// Initialize the web implementation
const onnxRunner = new OnnxRunnerWeb("/path/to/model.onnx");
await onnxRunner.init();

// Use it with SignRecognizer
// ...
```

### Mobile (React Native)

```typescript
import { SignRecognizer } from "triosigno-lib-core";
import { OnnxRunnerMobile } from "triosigno-lib-mobile";

// Initialize the mobile implementation
const onnxRunner = new OnnxRunnerMobile("/path/to/model.onnx");
await onnxRunner.init();

// Use it with SignRecognizer
// ...
```

## Vite Troubleshooting

If you encounter WASM-related issues with Vite, add this to your `vite.config.ts`:

```typescript
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["onnxruntime-web"], // Ensures proper handling of WASM
  },
});
```

If you have a file system access error:

```typescript
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [
    /* your plugins */
  ],
  server: {
    fs: {
      allow: [path.resolve(__dirname, "node_modules")],
    },
  },
});
```

## Documentation

For detailed documentation, please refer to the individual package READMEs:

- [triosigno-lib-core](./core/README.md)
- [triosigno-lib-web](./web/README.md)
- [triosigno-lib-mobile](./mobile/README.md)

## License

MIT
