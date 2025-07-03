/**
 * triosignolib
 * Shared feature between mobile frontend and web frontend.
 * @version 1.0.0
 * @author TrioSigno development Team
 * @license MIT
 * @description This library provides functions to use AI model on frontend.
 */

// Interface for file system access abstraction
export interface RNFSInterface {
  exists: (path: string) => Promise<boolean>;
  readFile: (path: string, encoding?: string) => Promise<string>;
}

// Global variable to hold the file system implementation
let rnfsImplementation: RNFSInterface | null = null;

// Function to set the file system implementation
export function setRNFS(implementation: RNFSInterface): void {
  rnfsImplementation = implementation;
}

// Function to get the file system implementation
export function getRNFS(): RNFSInterface {
  if (!rnfsImplementation) {
    throw new Error('RNFS implementation not set. Call setRNFS first.');
  }
  return rnfsImplementation;
}

export * from './sign_recognizer/sign_recognizer';
export * from './sign_recognizer/draw_landmark';
export * from './sign_recognizer/utils/clock';
export * from './sign_recognizer/utils/rot_3D';
export * from './sign_recognizer/datasample';
export * from './sign_recognizer/gestures/gestures';
export * from './sign_recognizer/gestures/data_gestures';
export * from './onnx_interface';
export * from './mediapipe_interface';

export function coreGreet(name: string): string {
  return `Hello, ${name} from core!`;
}
