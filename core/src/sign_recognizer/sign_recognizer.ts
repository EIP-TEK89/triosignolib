import { OnnxRunner, ModelConfig, ModelConfigFromJson } from "../onnx_interface";
import { MediapipeRunner } from "../mediapipe_interface"
import { DataSample } from "./datasample";
import { DataGestures } from "./gestures/data_gestures"

import axios, { AxiosResponse } from "axios";
import JSZip from "jszip";
import { Clock } from "./utils/clock";


/**
 * @description Interface that stores the result of the sign recognizer model,
 * and all the landmarks.
 */
export interface ModelsPredictions {
  signId: number;
  signLabel: string; // Where you can get the name of the recognized sign
  landmarks: DataGestures | null;
}

function computeFrameDifference(prevFrame: ImageData, currentFrame: ImageData): number {
  let diff = 0;
  let step = Math.round(prevFrame.data.length / 100);
  for (let i = 0; i < prevFrame.data.length; i += step) {
    diff += Math.abs(prevFrame.data[i] - currentFrame.data[i]);     // Red
    diff += Math.abs(prevFrame.data[i + 1] - currentFrame.data[i + 1]); // Green
    diff += Math.abs(prevFrame.data[i + 2] - currentFrame.data[i + 2]); // Blue
  }
  return diff;
}


/**
 * SignRecognizer class
 * This class is used to recognize signs using a ONNX model and a Hand Landmarker model.
 * It uses the ONNX Runtime Web for running the model and the MediaPipe Hand Landmarker for hand detection.
 */
export class SignRecognizer<T> {
  private session: OnnxRunner;
  private mediapipe_session: MediapipeRunner<T>;

  private isPredicting: boolean = false;
  private lastPrediction: ModelsPredictions;
  private datasample: DataSample = new DataSample("test", []);
  private prevFrame: ImageData | null = null;
  private canvas: HTMLCanvasElement = document.createElement("canvas");
  private clock: Clock = new Clock(30);

  

  /**
   *
   * @description Initialize the class and loads the models provided as argument.
   * Most of the time only onnxModelPath variable needs to be set.
   *
   * @argument onnxRunner: The ONNX Runtime instance to use depending on the platform.
   * @argument onnxModelPath: The Sign Recognizer model to load (usually indicated by the lesson you fetched)
   * @argument handLandmarkerPath: Defines where to load the handlandmarker model.
   * @argument faceLandmarkerPath: Defines where to load the facelandmarker model.
   * @argument bodyLandmarkerPath: Defines where to load the bodylandmarker model.
   */
  constructor(onnxRunner: OnnxRunner, mediapipeRunner: MediapipeRunner<T>) {
    this.session = onnxRunner;
    this.mediapipe_session = mediapipeRunner;

    this.session.fetchModel()
    this.mediapipe_session.loadHandTrackModel()
    // this.mediapipe_session.loadBodyTrackModel()
    // this.mediapipe_session.loadFaceTrackModel()

    this.lastPrediction = {
      signId: -1,
      signLabel: "Null",
      landmarks: null 
    };
  }

  /**
   * @description Run a prediction and return its result asynchronously.
   * Unless your need is specific prefer using predict() that do the same thing but optimized.
   *
   * @param elem Video element where the sign to recognize is
   * @param lazy Optimize the prediction by skipping similar frames,
   * I recommend to set it true unless you are encountering bug or debugging.
   * @returns A ModelsPrediction object containing the latest model prediction.
   */
  async predictAsync(elem: HTMLVideoElement, lazy: boolean = true): Promise<ModelsPredictions> {

    if (this.isPredicting || elem.videoHeight === 0 || elem.videoWidth === 0) {
      return this.lastPrediction
    }
    this.isPredicting = true;
    if (lazy && this.canvas) {
      this.canvas.width = elem.videoWidth;
      this.canvas.height = elem.videoHeight;
      const ctx = this.canvas.getContext("2d");
      if (!ctx || this.canvas.height === 0 || this.canvas.width === 0) {
        this.isPredicting = false;
        return this.lastPrediction;
      }
      ctx.drawImage(elem, 0, 0, this.canvas.width, this.canvas.height);
      const currentFrame: ImageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

      if (this.prevFrame && computeFrameDifference(this.prevFrame, currentFrame) === 0) {
        this.isPredicting = false;
        return this.lastPrediction;
      }
      this.prevFrame = currentFrame;
    }
    const handlandmark: HandLandmarkerResult | null = await this.detectHands(elem);


    this.lastPrediction.landmarks.hand = handlandmark;
    if (this.clock.isTimeToRun()) {
      if (handlandmark) {
        this.datasample.insertGestureFromLandmarks(0, handlandmark);
        const config: ModelConfig | null = this.session.config();
        if (config === null) {
          console.error("Sign recognizer config is not loaded yet!");
          this.isPredicting = false;
          return this.lastPrediction;
        }
        while (this.datasample.gestures.length > config.memory_frame) {
          this.datasample.gestures.pop();
        }
        this.lastPrediction.signId = await this.recognizeSign(this.datasample);
        this.lastPrediction.signLabel = config.labels[this.lastPrediction.signId];
      } else {
        this.lastPrediction.signId = -1;
        this.lastPrediction.signLabel = "Null";
      }
    }
    this.isPredicting = false;
    return this.lastPrediction;
  }

  /**
   * @description This call only run a prediction if there's no prediction in progress,
   * otherwise it will return the last completed prediction.
   * If you want to manually run a prediction use predictAsync method instead.
   *
   * @param elem Video element where the sign to recognize is
   * @param lazy Optimize the prediction by skipping similar frames, I recommend to set it false only if you want to debug
   * @returns A ModelsPrediction object containing the latest model prediction.
   */
  predict(elem: HTMLVideoElement, lazy: boolean = true): ModelsPredictions {
    if (!this.isPredicting) {
      this.predictAsync(elem, lazy);
    }
    return this.lastPrediction;
  }

  /**
   * @description Detect hands in the video element and return the result.
   * @param elem Video element where the sign to recognize is
   * @returns A HandLandmarkerResult object containing the hand landmarks.
   */
   async detectHands(elem: HTMLVideoElement): Promise<HandLandmarkerResult | null> {

  }

    /**
     * @description Detect hands in the video element and return the result.
     * @param elem Video element where the sign to recognize is
     * @returns A HandLandmarkerResult object containing the hand landmarks.
    */
  async recognizeSign(datasample: DataSample): Promise<number> {
    const config: ModelConfig | null = this.session.config();
    if (!this.session.isModelLoaded() || config === null) {
      console.error("ONNX model is not loaded yet!");
      return -1;
    }

    if (config.one_side) {
      datasample.moveToOneSide();
    }

    return this.session.run(datasample);
  }
}

