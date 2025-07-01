import { HandLandmarker, FilesetResolver, HandLandmarkerResult } from "@mediapipe/tasks-vision";

import { MediapipeRunner, DataGestures } from "triosigno-lib";

const HANDLANDMARKER_MODEL_PATH: string = `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`



export class MediapipeRunnerWeb extends MediapipeRunner<HTMLVideoElement> {
    // Handlandmarker variables
    private handLandmarker: HandLandmarker | null = null;

    async loadHandTrackModel() {
        console.log("Loading Hand Landmarker model...");
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: HANDLANDMARKER_MODEL_PATH,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2
        });
        console.log("Hand Landmarker model loaded !");
    }

    async runHandTrackModel(video: HTMLVideoElement): Promise<DataGestures> {
        const gesture: DataGestures = new DataGestures();

        if (video.videoHeight === 0 || video.videoWidth === 0) {
            console.warn("HTMLVideoElement has no dimensions yet, returning empty gesture.");
            return gesture
        }

        if (!this.handLandmarker) {
            console.warn("Hand Landmarker model is not loaded yet!");
            return gesture;
        }

        let startTimeMs = performance.now();
        const result: HandLandmarkerResult = this.handLandmarker.detectForVideo(video, startTimeMs);
        gesture.setHandsFromHandLandmarkerResult(result);

        // let tmp = result.landmarks;
        // result.landmarks = result.worldLandmarks;
        result.worldLandmarks = result.landmarks;
        gesture.other_hand_gesture = DataGestures.buildFromHandLandmarkerResult(result);

        return gesture;
    }
    async loadBodyTrackModel() {
        throw new Error("Not implemented")
    }
    async runBodyTrackModel(video: HTMLVideoElement): Promise<DataGestures> {
        throw new Error("Not implemented")
    }
    async loadFaceTrackModel() {
        throw new Error("Not implemented")
    }
    async runFaceTrackModel(video: HTMLVideoElement): Promise<DataGestures> {
        throw new Error("Not implemented")
    }
    async runAll(video: HTMLVideoElement): Promise<DataGestures> {
        let handGesture: DataGestures = await this.runHandTrackModel(video);
        return handGesture;
    }
}
