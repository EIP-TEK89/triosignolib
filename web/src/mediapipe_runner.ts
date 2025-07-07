import {
  HandLandmarker,
  FilesetResolver,
  HandLandmarkerResult,
  PoseLandmarker,
  FaceLandmarker,
  PoseLandmarkerResult,
  FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";

import { MediapipeRunner, DataGestures } from "triosigno-lib-core";

const VISION_TASKS_WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm";

const HANDLANDMARKER_MODEL_PATH: string = `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`;
const BODYLANDMARKER_MODEL_PATH = `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task`;
const FACELANDMARKER_MODEL_PATH = `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`;


export class MediapipeRunnerWeb extends MediapipeRunner<HTMLVideoElement> {
  // Handlandmarker variables
  private vision: FilesetResolver | null = null;

  private handLandmarker: HandLandmarker | null = null;
  private bodyLandmarker: PoseLandmarker | null = null;
  private faceLandmarker: FaceLandmarker | null = null;

  private alterner_counter: number = 0;
  private performance: number = 2;


  async loadHandTrackModel(num_hand: number = 2) {
    console.log("Loading Hand Landmarker model...");
    const vision = await FilesetResolver.forVisionTasks(VISION_TASKS_WASM_URL);
    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: HANDLANDMARKER_MODEL_PATH,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: num_hand,
    });

    // Warmup avec un canvas factice
    // this.runHandTrackModel(this.createWarmupCanvas() as any);
    console.log("Hand Landmarker model loaded !");
  }

  // private warmupHandModel() {
  //   if (!this.handLandmarker) return;

  //   try {
  //     const canvas = this.createWarmupCanvas();
  //     const startTimeMs = performance.now();
  //     this.handLandmarker.detectForVideo(canvas as any, startTimeMs);
  //     console.log("Hand model warmed up");
  //   } catch (error) {
  //     console.warn("Hand model warmup failed:", error);
  //   }
  // }

  async runHandTrackModel(video: HTMLVideoElement): Promise<DataGestures> {
    const gesture: DataGestures = new DataGestures();

    if (video.videoHeight === 0 || video.videoWidth === 0) {
      console.warn(
        "HTMLVideoElement has no dimensions yet, returning empty gesture."
      );
      return gesture;
    }

    if (!this.handLandmarker) {
      console.warn("Hand Landmarker model is not loaded yet!");
      return gesture;
    }

    let startTimeMs = performance.now();
    const result: HandLandmarkerResult = this.handLandmarker.detectForVideo(
      video,
      startTimeMs
    );
    gesture.setHandsFromHandLandmarkerResult(result);

    return gesture;
  }

  async loadBodyTrackModel(num_body: number = 1) {
    console.log("Loading Body Landmarker model...");
    const vision = await FilesetResolver.forVisionTasks(VISION_TASKS_WASM_URL);
    this.bodyLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: BODYLANDMARKER_MODEL_PATH,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: num_body,
    });

    // Warmup avec un canvas factice
    // this.runBodyTrackModel(this.createWarmupCanvas() as any);
    console.log("Body Landmarker model loaded !");
  }

  // private warmupBodyModel() {
  //   if (!this.bodyLandmarker) return;

  //   try {
  //     const canvas = this.createWarmupCanvas();
  //     const startTimeMs = performance.now();
  //     this.bodyLandmarker.detectForVideo(canvas as any, startTimeMs);
  //     console.log("Body model warmed up");
  //   } catch (error) {
  //     console.warn("Body model warmup failed:", error);
  //   }
  // }

  async runBodyTrackModel(video: HTMLVideoElement): Promise<DataGestures> {
    const gesture: DataGestures = new DataGestures();

    if (video.videoHeight === 0 || video.videoWidth === 0) {
      console.warn(
        "HTMLVideoElement has no dimensions yet, returning empty gesture."
      );
      return gesture;
    }

    if (!this.bodyLandmarker) {
      console.warn("Body Landmarker model is not loaded yet!");
      return gesture;
    }

    let startTimeMs = performance.now();
    const result: PoseLandmarkerResult = this.bodyLandmarker.detectForVideo(video, startTimeMs);
    gesture.setBodyFromHandLandmarkerResult(result);

    return gesture;
  }

  async loadFaceTrackModel(num_face: number = 1) {
    console.log("Loading Face Landmarker model...");
    const vision = await FilesetResolver.forVisionTasks(VISION_TASKS_WASM_URL);
    this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: FACELANDMARKER_MODEL_PATH,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numFaces: num_face,
    });

    // Warmup avec un canvas factice
    // this.runFaceTrackModel(this.createWarmupCanvas() as any);
    console.log("Face Landmarker model loaded !");
  }

  // private warmupFaceModel() {
  //   if (!this.faceLandmarker) return;

  //   try {
  //     const canvas = this.createWarmupCanvas();
  //     const startTimeMs = performance.now();
  //     this.faceLandmarker.detectForVideo(canvas as any, startTimeMs);
  //     console.log("Face model warmed up");
  //   } catch (error) {
  //     console.warn("Face model warmup failed:", error);
  //   }
  // }

  async runFaceTrackModel(video: HTMLVideoElement): Promise<DataGestures> {
    const gesture: DataGestures = new DataGestures();

    if (video.videoHeight === 0 || video.videoWidth === 0) {
      console.warn(
        "HTMLVideoElement has no dimensions yet, returning empty gesture."
      );
      return gesture;
    }

    if (!this.faceLandmarker) {
      console.warn("Face Landmarker model is not loaded yet!");
      return gesture;
    }

    let startTimeMs = performance.now();
    const result: FaceLandmarkerResult = this.faceLandmarker.detectForVideo(video, startTimeMs);
    gesture.setFaceFromFaceLandmarkerResult(result);

    return gesture;
  }

  async runAll(video: HTMLVideoElement): Promise<DataGestures> {
    let gestures: DataGestures = new DataGestures();
    let handPromise: Promise<DataGestures> | null = null;
    let bodyPromise: Promise<DataGestures> | null = null;
    let facePromise: Promise<DataGestures> | null = null;

    if (this.handLandmarker) {
      try {
        handPromise = this.runHandTrackModel(video);
      } catch (error) {
        console.warn("Hand tracking failed:", error);
      }
    }

    // Optionally run body and face tracking if models are loaded
    if (this.bodyLandmarker) {
      try {
        bodyPromise = this.runBodyTrackModel(video);
      } catch (error) {
        console.warn("Body tracking failed:", error);
      }
    }

    if (this.faceLandmarker) {
      try {
        facePromise = this.runFaceTrackModel(video);
      } catch (error) {
        console.warn("Face tracking failed:", error);
      }
    }

    if (handPromise) {
      gestures.mergeDataGestures(await handPromise);
    }
    if (bodyPromise) {
      gestures.mergeDataGestures(await bodyPromise);
    }
    if (facePromise) {
      gestures.mergeDataGestures(await facePromise);
    }
    // console.log(handGesture)
    return gestures;
  }

  // /**
  //  * Warmup all loaded models to prevent cold start freezes
  //  * Call this method after loading all required models
  //  */
  // async warmupAllModels(): Promise<void> {
  //   console.log("Warming up all loaded models...");

  //   const promises: Promise<void>[] = [];

  //   if (this.handLandmarker) {
  //     this.warmupHandModel()
  //   }

  //   if (this.bodyLandmarker) {
  //     this.warmupBodyModel()
  //   }

  //   if (this.faceLandmarker) {
  //     this.warmupFaceModel()
  //   }

  //   await Promise.all(promises);
  //   console.log("All models warmed up successfully!");
  // }

  /**
   * Create a simple test canvas for warmup
   */
  private createWarmupCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Créer un pattern simple pour que le modèle ait quelque chose à analyser
      ctx.fillStyle = '#404040';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ajouter quelques formes simples
      ctx.fillStyle = '#808080';
      ctx.fillRect(100, 100, 50, 50);
      ctx.fillRect(400, 300, 50, 50);
    }

    return canvas;
  }
}
