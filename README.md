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

## Development

### Project Structure

```
.
├── core/            # Core TypeScript library
├── web/             # Web implementation
├── mobile/          # Mobile implementation
├── examples/        # Example projects
└── scripts/         # Build and development scripts
```

### Building Packages

To build all packages:

```bash
./publish.sh --dry-run
```

This will build all packages without publishing them to npm.

### Versioning

To update the version numbers of all packages:

```bash
./version.sh patch  # For patch version increment (0.1.0 -> 0.1.1)
./version.sh minor  # For minor version increment (0.1.0 -> 0.2.0)
./version.sh major  # For major version increment (0.1.0 -> 1.0.0)
./version.sh 2.0.0  # For specific version
```

### Publishing Packages

See [DEPLOY.md](DEPLOY.md) for detailed instructions on how to configure and use the automated publishing process.

## Automated Deployment

This project uses GitHub Actions for automated deployment. The workflow is defined in `.github/workflows/deploy.yml`.

For more information on how to set up and use the automated deployment process, see [DEPLOY.md](DEPLOY.md).

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
