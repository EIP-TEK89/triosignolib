import * as ort from "onnxruntime-react-native";
import { readFile } from 'react-native-fs';
import { OnnxRunner, ModelConfig, DataSample, FIELDS, FIELD_DIMENSION, ModelConfigFromJson } from "triosigno-lib-core";
import JSZip from "jszip";
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

/**
 * Helper: writes ArrayBuffer to a file on device, returns local file URI
 */
async function saveArrayBufferToFile(arrayBuffer: ArrayBuffer, filename: string): Promise<string> {
  const path = `${FileSystem.cacheDirectory}${filename}`;
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');

  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return path;  // file://... URI
}

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

  async init(data: JSZip): Promise<void> {
    let onnxFilePath: string | null = null;
    let jsonFileText: string | null = null;

    // console.log("[ONNX-mobile] Getting files...");
    for (const filename of Object.keys(data.files)) {
      // console.log("[ONNX-mobile] Found file:", filename);

      const file = data.file(filename);
      if (!file) continue;

      if (filename.endsWith(".onnx")) {
        // console.log("[ONNX-mobile] Extracting ONNX model as ArrayBuffer...");
        const arrayBuffer = await file.async("arraybuffer");
        // console.log("[ONNX-mobile] Writing ONNX model to device storage...");
        onnxFilePath = await saveArrayBufferToFile(arrayBuffer, filename);
        // console.log("[ONNX-mobile] ONNX model saved at:", onnxFilePath);
      }

      if (filename.endsWith(".json")) {
        // console.log("[ONNX-mobile] Reading JSON config...");
        jsonFileText = await file.async("text");
        // console.log("[ONNX-mobile] JSON config loaded.");
      }
    }

    if (!onnxFilePath) throw new Error("No .onnx file found in ZIP.");
    if (!jsonFileText) throw new Error("No .json file found in ZIP.");

    console.log("[ONNX-mobile] Model unzipped and saved.");
    console.log("[ONNX-mobile] Loading model with path:", onnxFilePath);

    const buffer = await readFile(onnxFilePath, 'base64');
    const uint8Model = Uint8Array.from(atob(buffer), c => c.charCodeAt(0));
    this.session = await ort.InferenceSession.create(uint8Model);
    this.modelConfig = ModelConfigFromJson(JSON.parse(jsonFileText));
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
