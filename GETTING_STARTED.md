# Getting Started with TrioSigno Library

This guide will walk you through the complete process of setting up and using the TrioSigno sign language recognition library in your application, from downloading models to implementing a working camera-based sign recognition system.

## Table of Contents

- [Downloading the Model](#downloading-the-model)
- [Setting Up Your Project](#setting-up-your-project)
  - [For Web (React)](#for-web-react)
  - [For Mobile (React Native)](#for-mobile-react-native)
- [Basic Implementation](#basic-implementation)
  - [Web Implementation](#web-implementation)
  - [Mobile Implementation](#mobile-implementation)
- [Advanced Usage](#advanced-usage)
  - [Customizing Model Paths](#customizing-model-paths)
  - [Processing Recognition Results](#processing-recognition-results)
- [Troubleshooting](#troubleshooting)

## Downloading the Model

1. Download the sign recognition model from: https://triosigno.com/api/files/download/alphabet.zip

2. Extract the zip file, which should contain:
   - `model.onnx` - The ONNX model file for sign recognition
   - `config.json` - Configuration file for the model
   - Other supporting files

3. Place these files in your project's public or assets directory:
   - **For Web**: In the `public` folder (e.g., `public/models/alphabet/`)
   - **For Mobile**: In the `assets` folder (e.g., `assets/models/alphabet/`)

## Setting Up Your Project

### For Web (React)

1. Create or navigate to your React project:

```bash
# Create a new React project if needed
npx create-react-app my-sign-app
cd my-sign-app
```

2. Install the TrioSigno libraries:

```bash
npm install triosigno-lib-core triosigno-lib-web
```

3. Install additional dependencies:

```bash
npm install onnxruntime-web @mediapipe/tasks-vision
```

4. Configure your build tools (for Vite, Webpack, etc.):

For Vite, add to `vite.config.ts`:

```typescript
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["onnxruntime-web"], // Ensures proper handling of WASM
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, "node_modules")],
    },
  },
});
```

### For Mobile (React Native)

1. Create or navigate to your React Native project:

```bash
# Create a new React Native project if needed
npx react-native init MySignApp
cd MySignApp
```

2. Install the TrioSigno libraries:

```bash
npm install triosigno-lib-core triosigno-lib-mobile
```

3. Install required dependencies:

```bash
npm install react-native-fs react-native-vision-camera onnxruntime-react-native react-native-fast-tflite vision-camera-resize-plugin
```

4. Link native modules:

```bash
npx pod-install ios  # for iOS
```

5. Configure permissions in your app:
   - For Android: Edit `AndroidManifest.xml` to add camera permissions
   - For iOS: Edit `Info.plist` to add camera usage description

## Basic Implementation

### Web Implementation

Create a component for sign recognition with webcam:

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { SignRecognizer } from 'triosigno-lib-core';
import { OnnxRunnerWeb, MediapipeRunnerWeb } from 'triosigno-lib-web';

function SignDetector() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [recognizedSign, setRecognizedSign] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const recognizerRef = useRef<SignRecognizer<HTMLVideoElement> | null>(null);

  // Initialize the recognizer
  useEffect(() => {
    async function initializeRecognizer() {
      try {
        // Initialize MediaPipe for hand tracking
        const mediapipeRunner = new MediapipeRunnerWeb();
        await mediapipeRunner.loadHandTrackModel();

        // Initialize ONNX model for sign recognition
        const onnxRunner = new OnnxRunnerWeb('/models/alphabet/model.onnx');

        // Load the model and its configuration
        await this.session.load(); // This will load the model and parse the config

        // Alternative: if you already have the configuration separately
        // const modelConfig = {...your model config...};
        // await onnxRunner.init('/models/alphabet/model.onnx', modelConfig);

        // Create the sign recognizer
        recognizerRef.current = new SignRecognizer(onnxRunner, mediapipeRunner);
        setIsInitialized(true);
        console.log('Sign recognizer initialized successfully');
      } catch (error) {
        console.error('Failed to initialize sign recognizer:', error);
      }
    }

    initializeRecognizer();

    // Start webcam
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error('Error accessing webcam:', err);
        });
    }

    return () => {
      // Clean up webcam on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Process frames and detect signs
  useEffect(() => {
    if (!isInitialized || !videoRef.current) return;

    let animationFrameId: number;
    let processingFrame = false;

    const processFrame = async () => {
      if (processingFrame || !videoRef.current || !recognizerRef.current) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      processingFrame = true;
      try {
        // Use predict instead of predictAsync for non-blocking behavior
        const predictions = recognizerRef.current.predict(videoRef.current);
        setRecognizedSign(predictions.signLabel);
      } catch (error) {
        console.error('Error predicting sign:', error);
      } finally {
        processingFrame = false;
        animationFrameId = requestAnimationFrame(processFrame);
      }
    };

    animationFrameId = requestAnimationFrame(processFrame);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isInitialized]);

  return (
    <div>
      <h2>Sign Language Detector</h2>
      <div style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', maxWidth: '640px', height: 'auto' }}
        />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px', borderRadius: '5px' }}>
          Recognized Sign: {recognizedSign || 'None'}
        </div>
      </div>
      {!isInitialized && <div>Loading recognizer...</div>}
    </div>
  );
}

export default SignDetector;
```

### Mobile Implementation

Create a component for sign recognition with the device camera:

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { SignRecognizer } from 'triosigno-lib-core';
import { OnnxRunnerMobile, MediapipeRunnerMobile } from 'triosigno-lib-mobile';
import { runOnJS } from 'react-native-reanimated';
import * as RNFS from 'react-native-fs';

function SignDetector() {
  const [hasPermission, setHasPermission] = useState(false);
  const [recognizedSign, setRecognizedSign] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const recognizerRef = useRef(null);
  const devices = useCameraDevices();
  const device = devices.front;

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      setHasPermission(cameraPermission === 'granted');
    })();
  }, []);

  // Initialize the sign recognizer
  useEffect(() => {
    const initializeRecognizer = async () => {
      try {
        // Initialize MediaPipe for hand tracking
        const mediapipeRunner = new MediapipeRunnerMobile(
          RNFS.MainBundlePath + '/models/hand_detector.tflite',
          RNFS.MainBundlePath + '/models/hand_landmarks_detector.tflite'
        );
        await mediapipeRunner.loadHandTrackModel();

        // Initialize ONNX model for sign recognition
        const modelPath = RNFS.DocumentDirectoryPath + '/models/alphabet/model.onnx';
        // Copy model from assets to DocumentDirectory if needed
        if (!(await RNFS.exists(modelPath))) {
          await RNFS.mkdir(RNFS.DocumentDirectoryPath + '/models/alphabet');
          await RNFS.copyFileAssets('models/alphabet/model.onnx', modelPath);
        }

        const onnxRunner = new OnnxRunnerMobile(modelPath);

        // Load the model and its configuration
        await onnxRunner.load(); // This will load the model and parse the config

        // Alternative: if you already have the configuration separately
        // const modelConfig = {...your model config...};
        // await onnxRunner.init(modelPath, modelConfig);

        // Create the sign recognizer
        recognizerRef.current = new SignRecognizer(onnxRunner, mediapipeRunner);
        setIsInitialized(true);
        console.log('Sign recognizer initialized successfully');
      } catch (error) {
        console.error('Failed to initialize sign recognizer:', error);
      }
    };

    initializeRecognizer();
  }, []);

  // Process frames from the camera
  const frameProcessor = useFrameProcessor((frame) => {
    const processFrame = async () => {
      if (!recognizerRef.current || !isInitialized) return;

      try {
        // Use predict instead of predictAsync for non-blocking behavior
        const predictions = recognizerRef.current.predict(frame);
        runOnJS(setRecognizedSign)(predictions.signLabel);
      } catch (error) {
        console.error('Error predicting sign:', error);
      }
    };

    processFrame();
  }, [isInitialized]);

  if (!hasPermission) {
    return <Text>Camera permission is required</Text>;
  }

  if (!device) {
    return <Text>Loading camera...</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={5}
      />
      <View style={styles.overlay}>
        <Text style={styles.sign}>Recognized Sign: {recognizedSign || 'None'}</Text>
      </View>
      {!isInitialized && <Text style={styles.loading}>Loading recognizer...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  sign: {
    color: 'white',
    fontSize: 16,
  },
  loading: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: 10,
    borderRadius: 5,
  },
});

export default SignDetector;
```

## Advanced Usage

### Customizing Model Paths

You can customize the paths to your model files based on your project structure:

```typescript
// Web example with custom path
const onnxRunner = new OnnxRunnerWeb("/custom/path/to/model.onnx");

// Mobile example with custom path
const onnxRunner = new OnnxRunnerMobile(
  RNFS.DocumentDirectoryPath + "/custom/path/to/model.onnx"
);
```

### Processing Recognition Results

The recognition results contain more than just the sign label:

```typescript
// You can use either synchronous (non-blocking) or asynchronous (blocking) prediction
// Synchronous (returns immediately with the latest prediction)
const predictions = signRecognizer.predict(videoElement);

// Asynchronous (waits for the prediction to complete)
// const predictions = await signRecognizer.predictAsync(videoElement);

// The recognized sign label (e.g., "A", "B", etc.)
console.log("Sign:", predictions.signLabel);

// The ID of the recognized sign
console.log("Sign ID:", predictions.signId);

// The hand landmarks detected (can be used for visualization)
console.log("Landmarks:", predictions.landmarks);
```

You can use the landmarks to draw hand tracking visualization:

```typescript
import { drawHandLandmarkerResult } from "triosigno-lib-core";

// In your component:
const canvasRef = useRef<HTMLCanvasElement>(null);

// After getting predictions:
if (canvasRef.current && predictions.landmarks) {
  const ctx = canvasRef.current.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    drawHandLandmarkerResult(ctx, predictions.landmarks);
  }
}
```

## Troubleshooting

### Model Loading Issues

If you encounter problems loading the model:

1. **Check the file path**: Make sure the model path is correct and accessible
2. **CORS issues in web**: For web applications, ensure the model is served from the same origin or CORS is configured correctly
3. **File permissions in mobile**: For mobile applications, ensure the app has permissions to access the file system

### Performance Optimization

If recognition is slow:

1. **Reduce frame processing rate**: Process fewer frames per second
2. **Use a lower resolution camera feed**: Resize the input to a smaller resolution
3. **Enable GPU acceleration**: Make sure WebGL/GPU delegation is enabled when available

### Common Errors

- **"Failed to load model"**: Check if the model file exists at the specified path
- **"No hand detected"**: Ensure your hand is visible in the camera frame
- **WASM issues in web**: Follow the Vite configuration in the main README for proper WASM support
