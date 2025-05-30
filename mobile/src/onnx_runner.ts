import * as ort from "onnxruntime-react-native";
import { readFile } from 'react-native-fs';
import { OnnxRunner, ModelConfig, DataSample, FIELDS, FIELD_DIMENSION } from "triosigno-lib";

function softmax(arr: Float32Array): Float32Array {
  const max = Math.max(...arr);
  const exp = arr.map(x => Math.exp(x - max));
  const sum = exp.reduce((a, b) => a + b, 0);
  return new Float32Array(exp.map(x => x / sum));
}

function to_tensor(datasample: DataSample, sequenceLength: number, validFields: string[] = FIELDS): ort.Tensor {
  const fieldCount = validFields.length * FIELD_DIMENSION;
  const data = new Float32Array(sequenceLength * fieldCount);

  for (let i = 0; i < Math.min(sequenceLength, datasample.gestures.length); i++) {
    const frameData = datasample.gestures[i].get1DArray(validFields);
    data.set(frameData, i * fieldCount);
  }

  const tensorShape = [sequenceLength, fieldCount];
  return new ort.Tensor("float32", data, tensorShape);
}

export class OnnxRunnerMobile extends OnnxRunner {
  session: ort.InferenceSession | null = null;
  modelConfig: ModelConfig | null = null;

  constructor(model_path: string | null = null) {
    super(model_path);
  }

  config(): ModelConfig | null {
    return this.modelConfig;
  }

  isModelLoaded(): boolean {
    return this.session !== null && this.config() !== null;
  }

  async init(modelUrl: string, modelConfig: ModelConfig): Promise<void> {
    const buffer = await readFile(modelUrl, 'base64');
    const uint8Model = Uint8Array.from(atob(buffer), c => c.charCodeAt(0));
    this.session = await ort.InferenceSession.create(uint8Model);
    this.modelConfig = modelConfig;
  }

  async run(input: DataSample): Promise<number> {
    const config: ModelConfig | null = this.config();
    if (!this.isModelLoaded() || config === null || this.session === null) {
      console.error("ONNX model is not loaded yet!");
      return -1;
    }

    const tensor: ort.Tensor = to_tensor(input, config.memory_frame, config.active_gestures.getActiveFields());
    const inputName = this.session.inputNames[0];
    const feeds = { [inputName]: tensor };

    const outputTensor = await this.session.run(feeds);
    const outputName = this.session.outputNames[0];
    const outputData = outputTensor[outputName].data as Float32Array;

    const probabilities = softmax(outputData);
    return probabilities.indexOf(Math.max(...probabilities));
  }
}