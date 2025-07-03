# triosignolib

## Installation

Clone this repo the root of your code space.

Then:
```bash
npm install ./triosignolib/core
```
Then depending you platform:
> For web browser
```bash
npm install ./triosignolib/web
```
> For mobile (Android/IOS)
```bash
npm install ./triosignolob/mobile
```

Then use it doing:
```ts
import { WhateverYouWantToImportFromTheLib } from "triosigno-lib"
```
Check the library documentation [here](https://github.com/EIP-TEK89/trio-signo-fullstack/wiki/TrioSignoLib)

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
			path.resolve(__dirname, 'triosignolib')
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
In case of this error
```
ERROR  Frame Processor Error: Frame.toArrayBuffer() is only available if minSdkVersion is set to 26 or higher!, js engine: VisionCamera
```
Install this
```
npx expo install expo-build-properties
```
And add this in your app.json
```json
{
	"expo": {
		"plugins": [
	  		[
				"expo-build-properties",
				{
		  			"android": {
						"minSdkVersion": 26
		  			}
				}
	  		],
		]
  	}
}
````
