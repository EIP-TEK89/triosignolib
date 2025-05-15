import { DataSample } from "./sign_recognizer/datasample";
import { ActiveGestures } from "./sign_recognizer/gestures/active_gestures";

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
  abstract config(): ModelConfig | null;
  abstract isModelLoaded(): boolean;
  abstract load(modelUrl: string, modelConfig: ModelConfig): Promise<void>;
  abstract run(input: DataSample): Promise<number>;
}
