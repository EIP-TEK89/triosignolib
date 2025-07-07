import { DataGestures } from "./sign_recognizer/gestures/data_gestures"

export abstract class MediapipeRunner<T> {
    abstract loadHandTrackModel(num_hand?: number): void;
    abstract runHandTrackModel(video: T): Promise<DataGestures>;
    abstract loadBodyTrackModel(num_body?: number): void;
    abstract runBodyTrackModel(video: T): Promise<DataGestures>;
    abstract loadFaceTrackModel(num_face?: number): void;
    abstract runFaceTrackModel(video: T): Promise<DataGestures>;
    abstract runAll(video: T): Promise<DataGestures>;
}

export class _MediapipeRunner extends MediapipeRunner<number> {
    constructor() {
        super();
    }

    async loadHandTrackModel(num_hand: number = 2) {
        throw new Error("Not implemented");
    }
    async runHandTrackModel(video: number): Promise<DataGestures> {
        throw new Error("Not implemented");
    }
    async loadBodyTrackModel(num_body: number = 1) {
        throw new Error("Not implemented");
    }
  async runBodyTrackModel(video: number): Promise<DataGestures> {
    throw new Error("Not implemented");
  }
  async loadFaceTrackModel(num_face: number = 1) {
    throw new Error("Not implemented");
  }
  async runFaceTrackModel(video: number): Promise<DataGestures> {
    throw new Error("Not implemented");
  }
  async runAll(video: number): Promise<DataGestures> {
    throw new Error("Not implemented");
  }
}
