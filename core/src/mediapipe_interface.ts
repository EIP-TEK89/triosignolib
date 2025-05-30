import { DataGestures } from "./sign_recognizer/gestures/data_gestures"

export abstract class MediapipeRunner<T> {
    abstract loadHandTrackModel(): void;
    abstract runHandTrackModel(video: T): DataGestures;
    abstract loadBodyTrackModel(): void;
    abstract runBodyTrackModel(video: T): DataGestures;
    abstract loadFaceTrackModel(): void;
    abstract runFaceTrackModel(video: T): DataGestures;
    abstract runAll(video: T): DataGestures;
}
