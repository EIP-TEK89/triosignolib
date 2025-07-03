// import { setRNFS } from "triosigno-lib-core";

// // Initialiser une implémentation factice de RNFS pour l'environnement web
// setRNFS({
//   exists: async () => false,
//   readFile: async () => {
//     throw new Error("readFile not available in web environment");
//   },
// });

export * from "./onnx_runner";
export * from "./mediapipe_runner";
