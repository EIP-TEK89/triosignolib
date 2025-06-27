import {loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { Frame } from 'react-native-vision-camera';

import { MediapipeRunner, DataGestures } from "triosigno-lib";

const { resize } = useResizePlugin()


export class MediapipeRunnerMobile extends MediapipeRunner<Frame> {
    private hand_detector: TensorflowModel | null = null;
    private hand_landmarker: TensorflowModel | null = null;

  async loadHandTrackModel() {
    console.log("Loading Hand Landmarker model...");
    try {
        this.hand_detector = await loadTensorflowModel({ url: '../models/hand_detector.tflite' })
        console.log("Hand Detector model loaded!");
        this.hand_landmarker = await loadTensorflowModel({ url: '../models/hand_landmarker.tflite' });
        console.log("Hand Landmarker model loaded!");
    } catch (error) {
      console.error("Error loading Hand Landmarker model:", error);
    }
  }

  async runHandTrackModel(video: Frame): Promise<DataGestures> {
    const gesture = new DataGestures();

    if (!this.hand_detector || !this.hand_landmarker) {
        console.error("Hand tracking models are not loaded.");
        return gesture;
    }

    try {
        // Resize frame to model expected size
        const resizedUri = resize(video, {
            scale: {
                width: 192,
                height: 192,
            },
                pixelFormat: 'rgb',
                dataType: 'uint8',
            })

        // Run hand detection model
        const [palmLocations, palmScores] = this.hand_detector.runSync([resizedUri]);
        const THRESHOLD = 0.5;
        const palms = [];

        for (let i = 0; i < 2016; i++) {
          if (palmScores[i] > THRESHOLD) {
            const palmFeature = palmLocations[i]; // length 18 array
            // const palm = decodePalm(palmFeature); // your custom decode function
            // palms.push({ palm, score: palmScores[i] });
          }
        }
    } catch (error) {
        console.error("Error running hand tracking model:", error);
    }
    return gesture;
  }

  async loadBodyTrackModel() {
    throw new Error("Not implemented");
  }
  async runBodyTrackModel(video: Frame): Promise<DataGestures> {
    throw new Error("Not implemented");
  }
  async loadFaceTrackModel() {
    throw new Error("Not implemented");
  }
  async runFaceTrackModel(video: Frame): Promise<DataGestures> {
    throw new Error("Not implemented");
  }
  async runAll(video: Frame): Promise<DataGestures> {
    const handGesture = await this.runHandTrackModel(video);
    return handGesture;
  }
}
