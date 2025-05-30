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

    async runHandTrackModel(video: HTMLVideoElement): DataGestures {
        if (!this.handLandmarker) {
            console.warn("Hand Landmarker model is not loaded yet!");
            return null;
        }

        let startTimeMs = performance.now();
        const result: HandLandmarkerResult = this.handLandmarker.detectForVideo(video, startTimeMs);
        return DataGestures.buildFromHandLandmarkerResult(result);
    }
    // async loadBodyTrackModel(): boolean {
    //     throw("Not implemented")
    // }
    // async runBodyTrackModel(): DataGestures {
    //     throw("Not implemented")
    // }
    // async loadFaceTrackModel(): boolean {
    //     throw("Not implemented")
    // }
    // async runFaceTrackModel(): DataGestures {
    //     throw("Not implemented")
    // }
    async runAll(video: HTMLVideoElement): DataGestures {
        let handGesture: DataGestures = this.runHandTrackModel(video);
        return handGesture;
    }
}