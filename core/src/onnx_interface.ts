import { DataSample } from "./sign_recognizer/datasample";
import { ActiveGestures } from "./sign_recognizer/gestures/active_gestures";

import axios, { AxiosResponse } from "axios";
import JSZip from "jszip";

export interface ModelConfig {
  labels: string[];
  label_explicit: string[];
  memory_frame: number;
  active_gestures: ActiveGestures;
  label_map: { [key: string]: number };
  one_side: boolean;
  name: string;
  d_model: number;
  num_heads: number;
  num_layers: number;
  ff_dim: number;
}

export function ModelConfigFromJson(json: any): ModelConfig {
  return {
    labels: json.labels,
    label_explicit: json.label_explicit,
    memory_frame: json.memory_frame,
    active_gestures: new ActiveGestures(json.active_gestures),
    label_map: json.label_map,
    one_side: json.one_side,
    name: json.name,
    d_model: json.d_model,
    num_heads: json.num_heads,
    num_layers: json.num_layers,
    ff_dim: json.ff_dim,
  };
}

export abstract class OnnxRunner {
  protected model_path: string | null = null

  constructor(model_path: string | null) {
    this.model_path = model_path;
  }

  /**
   *
   * @description Load the ONNX model from a URL and parse the JSON metadata.
   * Throw an error if loading fail
   *
   * @argument path: The URL of the ONNX model to load.
   */
  async load(path: string | null = null) {
    console.log("Loading ONNX model...", path, this.model_path);

    let _path: string = ""

    if (path === null) {
      if (this.model_path === null) {
        throw new Error("No model to load (No model path specified)")
      }
      _path = this.model_path
    } else {
      _path = path
    }
    let zipData: ArrayBuffer | null = null;

    console.log("[ONNX] Fetching from network:", _path);
    const response: AxiosResponse = await axios.get(_path, { responseType: "arraybuffer" });
    zipData = response.data;
    console.log("[ONNX] Successfully downloaded from network.");

    if (!zipData) {
      throw new Error("Failed to load ONNX model data from local or network sources.");
    }
    console.log("[ONNX] Unzipping...");
    await this.init(await JSZip.loadAsync(zipData));
    console.log("[ONNX] ONNX model loaded !");
  }
  abstract config(): ModelConfig | null;
  abstract isModelLoaded(): boolean;
  abstract init(data: JSZip): Promise<void>;
  abstract run(input: DataSample): Promise<number>;
}

export class _OnnxRunner extends OnnxRunner {
  config(): ModelConfig | null {
    throw new Error("Not implemented");
  }
  isModelLoaded(): boolean {
    throw new Error("Not implemented");
  }
  async init(data: JSZip): Promise<void> {
    throw new Error("Not implemented");
  }
  async run(input: DataSample): Promise<number> {
    throw new Error("Not implemented");
  }
}
