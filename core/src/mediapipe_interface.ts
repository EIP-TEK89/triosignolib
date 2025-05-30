import { DataGestures } from "./sign_recognizer/gestures/data_gestures"

export abstract class MediapipeRunner<T> {
    abstract loadHandTrackModel(): void;
    abstract runHandTrackModel(video: T): Promise<DataGestures>;
    abstract loadBodyTrackModel(): void;
    abstract runBodyTrackModel(video: T): Promise<DataGestures>;
    abstract loadFaceTrackModel(): void;
    abstract runFaceTrackModel(video: T): Promise<DataGestures>;
    abstract runAll(video: T): Promise<DataGestures>;
}
