# TriOSignOLIB

Description de la bibliothèque.

## Installation

Clone this repo the root of your code space.

Then:
```bash
npm install ./triosignolib
```

Then use it doing:
```ts
import { WhateverYouWantToImportFromTheLib } from "triosignolib"
```
Check the library documentation [here](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

## Vite troubleshooting
If you have a vite error telling you it cannot import the path of the lib,
add this in your `vite.config.ts`.
```ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
		  allow: [
			path.resolve(__dirname, 'TriOSignOLIB')
		  ]
		}
	  }
});
```

If in your web browser you get one of the following error`:
- *GET
http://localhost/node_modules/.vite/deps/ort-wasm-simd-threaded.jsep.wasm 404 not found*
- *wasm streaming compile failed: TypeError: WebAssembly: Response has unsupported MIME type 'text/html' expected 'application/wasm'*

add this to your `vite.config.ts`.
```ts
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['onnxruntime-web'], // Ensures proper handling of WASM
  },
});
```

## EXPO GO troubleshooting
> Nothing yet
