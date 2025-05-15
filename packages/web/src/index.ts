import * as ort from "onnxruntime-web";
import { OnnxRunner, ModelConfig } from "../../core/src/onnx_interface";
import { DataSample } from "../../core/src/sign_recognizer/datasample";
import { FIELDS, FIELD_DIMENSION } from "../../core/src/sign_recognizer/gestures/gestures";

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

  config(): ModelConfig | null {
    return this.modelConfig;
  }

  isModelLoaded(): boolean {
    return this.session !== null && this.config() !== null;
  }

  async load(modelUrl: string, modelConfig: ModelConfig): Promise<void> {
    this.session = await ort.InferenceSession.create(modelUrl, {
      executionProviders: ['wasm'], // ✅ Ensure WebAssembly is used
    });
    this.modelConfig = modelConfig;
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
