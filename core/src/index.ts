/**
 * triosignolib
 * Shared feature between mobile frontend and web frontend.
 * @version 1.0.0
 * @author TrioSigno development Team
 * @license MIT
 * @description This library provides functions to use AI model on frontend.
 */

export * from "./sign_recognizer/sign_recognizer";
export * from "./sign_recognizer/draw_landmark";
export * from "./sign_recognizer/utils/clock";
export * from "./sign_recognizer/utils/rot_3D";
export * from "./sign_recognizer/datasample"
export * from "./sign_recognizer/gestures/gestures";
export * from "./sign_recognizer/gestures/data_gestures";
export * from "./onnx_interface";
export * from "./mediapipe_interface"

export function coreGreet(name: string): string {
  return `Hello, ${name} from core!`;
}
