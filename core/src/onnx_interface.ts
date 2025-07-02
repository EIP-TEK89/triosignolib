import { DataSample } from './sign_recognizer/datasample';
import { ActiveGestures } from './sign_recognizer/gestures/active_gestures';

import axios, { AxiosResponse } from 'axios';
// Définition de l'interface pour RNFS afin de pouvoir l'utiliser sans l'importer directement
interface RNFSInterface {
  exists?: (path: string) => Promise<boolean>;
  readFile?: (path: string, encoding?: string) => Promise<string>;
}

// Objet par défaut pour les environnements non-React Native
const defaultRNFS: RNFSInterface = {
  exists: async () => false,
  readFile: async () => '',
};

// Variable qui contiendra l'implémentation RNFS (réelle ou factice)
let RNFS: RNFSInterface = defaultRNFS;

// Cette fonction sera appelée par les implémentations spécifiques à la plateforme
export function setRNFS(rnfsImplementation: RNFSInterface) {
  RNFS = rnfsImplementation;
}

import JSZip from 'jszip';

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
  protected model_path: string | null = null;

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
    console.log('Loading ONNX model...', path, this.model_path);

    let _path: string = '';

    if (path === null) {
      if (this.model_path === null) {
        throw new Error('No model to load (No model path specified)');
      }
      _path = this.model_path;
    } else {
      _path = path;
    }
    let zipData: ArrayBuffer | null = null;

    console.log('Fetching model', _path);
    // ✅ Attempt 1: load from local filesystem
    try {
      console.log('[ONNX] Trying to load model from local path:', _path);
      if (RNFS.readFile) {
        const fileData = await RNFS.readFile(_path, 'base64');
        zipData = Uint8Array.from(atob(fileData), (c) =>
          c.charCodeAt(0),
        ).buffer;
        console.log('[ONNX] Successfully loaded from local storage.');
      } else {
        throw new Error('readFile method not available');
      }
    } catch (error) {
      console.warn(
        '[ONNX] Failed to read locally, falling back to axios:',
        error,
      );

      // ✅ Attempt 2: fetch from network
      console.log('[ONNX] Fetching from network:', _path);
      const response: AxiosResponse = await axios.get(_path, {
        responseType: 'arraybuffer',
      });
      zipData = response.data;
      console.log('[ONNX] Successfully downloaded from network.');
    }

    if (!zipData) {
      throw new Error(
        'Failed to load ONNX model data from local or network sources.',
      );
    }
    console.log('Unzipping');
    const zip = await JSZip.loadAsync(zipData);
    let onnxFileBlob: Blob | null = null;
    let jsonFileText: string | null = null;

    // Iterate over files in the ZIP
    for (const filename of Object.keys(zip.files)) {
      if (filename.endsWith('.onnx')) {
        const onnxFile: JSZip.JSZipObject | null = zip.file(filename);
        if (onnxFile) onnxFileBlob = await onnxFile.async('blob');
      }
      if (filename.endsWith('.json')) {
        const jsonFile: JSZip.JSZipObject | null = zip.file(filename);
        if (jsonFile) jsonFileText = await jsonFile.async('text');
      }
    }

    // Handle missing files
    if (!onnxFileBlob) throw new Error('No .onnx file found in ZIP.');
    if (!jsonFileText) throw new Error('No .json file found in ZIP.');

    // Convert ONNX blob to URL for ONNX Runtime Web
    const modelUrl = URL.createObjectURL(onnxFileBlob);

    // console.log("ONNX Model URL:", modelUrl);
    // console.log("JSON Config:", this.sign_recongnizer_config);
    // console.log("Active Fields:", this.sign_recongnizer_config.active_gestures.getActiveFields());

    console.log('Loading model...');
    await this.init(modelUrl, ModelConfigFromJson(JSON.parse(jsonFileText)));
    console.log('ONNX model loaded !');
  }
  abstract config(): ModelConfig | null;
  abstract isModelLoaded(): boolean;
  abstract init(modelUrl: string, modelConfig: ModelConfig): Promise<void>;
  abstract run(input: DataSample): Promise<number>;
}

export class _OnnxRunner extends OnnxRunner {
  config(): ModelConfig | null {
    throw new Error('Not implemented');
  }
  isModelLoaded(): boolean {
    throw new Error('Not implemented');
  }
  async init(modelUrl: string, modelConfig: ModelConfig): Promise<void> {
    throw new Error('Not implemented');
  }
  async run(input: DataSample): Promise<number> {
    throw new Error('Not implemented');
  }
}
