/**
 * TriOSignOLIB
 * Principales functions for TriOSignO
 * @version 1.0.0
 * @author TriOSignO
 * @license MIT
 * @description This library provides basic functions for TriOSignO.
 */

export * from "./sign_recognizer/sign_recognizer";
export * from "./sign_recognizer/draw_landmark";

export function greet(name: string): string {
  return `Hello, ${name}!`;
}
