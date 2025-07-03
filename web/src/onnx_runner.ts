import * as ort from "onnxruntime-web";
import { OnnxRunner, ModelConfig, DataSample, FIELDS, FIELD_DIMENSION, ModelConfigFromJson } from "triosigno-lib";
import JSZip from "jszip";

function softmax(arr: Float32Array): Float32Array {
  const max = Math.max(...arr);
  const exp = arr.map(x => Math.exp(x - max));  // Avoid overflow
  const sum = exp.reduce((a, b) => a + b, 0);
  return new Float32Array(exp.map(x => x / sum));
}

/**
 * Converts the sample gestures into an `ort.Tensor` for ONNX inference.
 * @param sequenceLength Number of frames to include in the tensor.
 * @param validFields List of valid fields to extract from gestures.
 * @returns `ort.Tensor` (ONNX Runtime)
 */
function to_tensor(datasample: DataSample, sequenceLength: number, validFields: string[] = FIELDS): ort.Tensor {
  const fieldCount = validFields.length * FIELD_DIMENSION;

  // Initialize a Float32Array for ONNX Tensor storage
  const data = new Float32Array(sequenceLength * fieldCount);

  for (let i = 0; i < Math.min(sequenceLength, datasample.gestures.length); i++) {
    const frameData = datasample.gestures[i].get1DArray(validFields);

    // Insert frame data into the main tensor array
    data.set(frameData, i * fieldCount);
  }

  // ONNX Tensors require an explicit shape definition
  const tensorShape = [sequenceLength, fieldCount];

  return new ort.Tensor("float32", data, tensorShape);
}


export class OnnxRunnerWeb extends OnnxRunner {
  session: ort.InferenceSession | null = null;
  modelConfig: ModelConfig | null = null;

  constructor(model_path: string | null = null) {
    super(model_path)
  }

  config(): ModelConfig | null {
    return this.modelConfig;
  }

  isModelLoaded(): boolean {
    return this.session !== null && this.config() !== null;
  }

  async init(data: JSZip): Promise<void> {
    // console.log("[ONNX-web] Getting files...");
    let onnxFileBlob: Blob | null = null;
    let jsonFileText: string | null = null;

    // Iterate over files in the ZIP
    for (const filename of Object.keys(data.files)) {
      // console.log("[ONNX-web] Found file:", filename);
      if (filename.endsWith(".onnx")) {
        const onnxFile: JSZip.JSZipObject | null = data.file(filename)
        if (onnxFile) {
          // console.log("[ONNX-web] making blob for ONNX file");
          onnxFileBlob = await onnxFile.async("blob");
        }
        // console.log("[ONNX-web] ONNX file found:", filename);
      }
      if (filename.endsWith(".json")) {
        const jsonFile: JSZip.JSZipObject | null = data.file(filename)
        if (jsonFile) {
          // console.log("[ONNX-web] making blob for JSON file");
          jsonFileText = await jsonFile.async("text");
        }
        // console.log("[ONNX-web] ONNX file found:", filename);
      }
    }

    // Handle missing files
    if (!onnxFileBlob) throw new Error("No .onnx file found in ZIP.");
    if (!jsonFileText) throw new Error("No .json file found in ZIP.");
    console.log("[ONNX-web] Model unzipped...");

    // Convert ONNX blob to URL for ONNX Runtime Web
    const modelUrl = URL.createObjectURL(onnxFileBlob);

    // console.log("ONNX Model URL:", modelUrl);
    // console.log("JSON Config:", this.sign_recongnizer_config);
    // console.log("Active Fields:", this.sign_recongnizer_config.active_gestures.getActiveFields());

    console.log("[ONNX-web] Loading model...");

    this.session = await ort.InferenceSession.create(modelUrl, {
      executionProviders: ['wasm'], // ✅ Ensure WebAssembly is used
    });
    this.modelConfig = ModelConfigFromJson(JSON.parse(jsonFileText));
  }

  async run(input: DataSample): Promise<number> {
    const config: ModelConfig | null = this.config();
    if (!this.isModelLoaded() || config === null || this.session === null) {
      console.error("ONNX model is not loaded yet!");
      return -1;
    }
    const tensor: ort.Tensor = to_tensor(input, config.memory_frame, config.active_gestures.getActiveFields());
    // console.log("Tensor shape:", tensor.dims, typeof tensor);
    const inputName = this.session.inputNames[0];

    // Create the correct 'feeds' object
    const feeds = { [inputName]: tensor };

    // Run the model
    const outputTensor: ort.InferenceSession.ReturnType = await this.session.run(feeds);
    // console.log("Output tensor:", outputTensor);

    const outputName = this.session.outputNames[0];  // Get the output name dynamically
    const outputData = outputTensor[outputName].data;
    const numericData = outputData as Float32Array;

    const probabilities = softmax(numericData); // Apply softmax to the output data

    // console.log(datasample.gestures[0], tensor)
    // console.log("Output tensor:", outputData, probabilities);

    return probabilities.indexOf(Math.max(...probabilities));;
  }
}
