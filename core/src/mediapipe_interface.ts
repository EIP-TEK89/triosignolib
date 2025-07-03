import { DataGestures } from "./sign_recognizer/gestures/data_gestures"

export abstract class MediapipeRunner<T> {
    abstract loadHandTrackModel(): void;
    abstract runHandTrackModel(video: T): DataGestures;
    abstract loadBodyTrackModel(): void;
    abstract runBodyTrackModel(video: T): Promise<DataGestures>;
    abstract loadFaceTrackModel(): void;
    abstract runFaceTrackModel(video: T): Promise<DataGestures>;
    abstract runAll(video: T): Promise<DataGestures>;
}

export class _MediapipeRunner extends MediapipeRunner<number> {
    constructor() {
        super();
    }

    async loadHandTrackModel() {
        throw new Error("Not implemented");
    }
    runHandTrackModel(video: number): DataGestures {
        throw new Error("Not implemented");
    }
    async loadBodyTrackModel() {
        throw new Error("Not implemented");
    }
  async runBodyTrackModel(video: number): Promise<DataGestures> {
    throw new Error("Not implemented");
  }
  async loadFaceTrackModel() {
    throw new Error("Not implemented");
  }
  async runFaceTrackModel(video: number): Promise<DataGestures> {
    throw new Error("Not implemented");
  }
  async runAll(video: number): Promise<DataGestures> {
    throw new Error("Not implemented");
  }
}
