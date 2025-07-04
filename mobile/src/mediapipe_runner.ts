import {loadTensorflowModel, TensorflowModel, useTensorflowModel, TensorflowPlugin } from 'react-native-fast-tflite';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { Frame, useFrameProcessor } from "react-native-vision-camera"
import { MediapipeRunner, DataGestures } from "triosigno-lib-core";

const { resize } = useResizePlugin()

import { Asset } from 'expo-asset';
import { Worklets } from 'react-native-worklets-core';

async function resolveModelUri(assetId: number): Promise<string> {
  const asset = Asset.fromModule(assetId);
  await asset.downloadAsync();
  return asset.localUri!;
}


export class MediapipeRunnerMobile extends MediapipeRunner<Frame> {

    private hand_detector_file: number;
    private hand_landmarker_file: number;

    public hand_detector: TensorflowPlugin | null = null;
    public hand_landmarker: TensorflowPlugin | null = null;

  constructor(
    hand_detector_file: number,
    hand_landmarker_file: number
  ) {
    super();
    this.hand_detector_file = hand_detector_file;
    this.hand_landmarker_file = hand_landmarker_file;
  }

  async loadHandTrackModel() {
    console.log("Loading Hand Landmarker model...");

    try {
        this.hand_detector = useTensorflowModel(
          {url: await resolveModelUri(this.hand_detector_file)}
        )
        console.log("Hand Detector model loaded!");
        this.hand_landmarker = useTensorflowModel(
          {url: await resolveModelUri(this.hand_landmarker_file)}
        );
        console.log("Hand tracking models loaded successfully.");
    } catch (error) {
      console.error("Error loading Hand Landmarker model:", error);
    }
  }

  runHandTrackModel(video: Frame): DataGestures {
    const gesture = new DataGestures();

    // if (!this.hand_detector || !this.hand_landmarker) {
    //     console.error("Hand tracking models are not loaded.");
    //     return gesture;
    // }

    // try {
    //     // Resize frame to model expected size
    //     const resizedUri = resize(video, {
    //         scale: {
    //             width: 192,
    //             height: 192,
    //         },
    //             pixelFormat: 'rgb',
    //             dataType: 'uint8',
    //         })

    //     // Run hand detection model
    //     const [palmLocations, palmScores] = this.hand_detector.runSync([resizedUri]);
    //     const THRESHOLD = 0.5;
    //     const palms = [];

    //     for (let i = 0; i < 2016; i++) {
    //       if (palmScores[i] > THRESHOLD) {
    //         console.log(`Palm detected with score: ${palmScores[i]}`);
    //         const palmFeature = palmLocations[i]; // length 18 array
    //         // const palm = decodePalm(palmFeature); // your custom decode function
    //         // palms.push({ palm, score: palmScores[i] });
    //       }
    //     }
    // } catch (error) {
    //     console.error("Error running hand tracking model:", error);
    // }
    return gesture;
  }

  async loadBodyTrackModel() {
    throw new Error("Not implemented");
  }
  async runBodyTrackModel(video: Frame): Promise<DataGestures> {
    throw new Error("Not implemented");
  }
  async loadFaceTrackModel() {
    throw new Error("Not implemented");
  }
  async runFaceTrackModel(video: Frame): Promise<DataGestures> {
    throw new Error("Not implemented");
  }
  async runAll(video: Frame): Promise<DataGestures> {
    const handGesture = await this.runHandTrackModel(video);
    return handGesture;
  }
}

const print = Worklets.createRunOnJS(console.log);

export const runHandTrackModel = (
  frame: Frame,
  hand_detector: TensorflowModel,
  hand_landmarker: TensorflowModel
) => {
  'worklet';
  let hand_track = {};

  try {
      // Resize frame to model expected size
      const resizedUri = resize(frame, {
          scale: {
              width: 192,
              height: 192,
          },
              pixelFormat: 'rgb',
              dataType: 'uint8',
          })
      // Run hand detection model
      const [palmLocations, palmScores] = hand_detector.runSync([resizedUri]);
      const THRESHOLD = 0.5;
      const palms = [];
      for (let i = 0; i < 2016; i++) {
        if (palmScores[i] > THRESHOLD) {
          console.log(`Palm detected with score: ${palmScores[i]}`);
          const palmFeature = palmLocations[i]; // length 18 array
          // const palm = decodePalm(palmFeature); // your custom decode function
          // palms.push({ palm, score: palmScores[i] });
        }
      }
    } catch (error) {
        console.error("Error running hand tracking model:", error);
    }
    return hand_track;
}

export const getLandmarks = (
  frame: Frame,
  hand_detector: TensorflowModel | null = null,
  hand_landmarker: TensorflowModel | null = null
) => {
  'worklet';
  let landmarks = {};
  print("heelo")
  if (hand_detector && hand_landmarker) {
    landmarks = {...landmarks, ...runHandTrackModel(frame, hand_detector, hand_landmarker)};
  }
  return landmarks;

}

// const frameProcessor = useFrameProcessor(
//   (frame) => {
//     'worklet'
//     if (model == null) return

//     // 1. Resize 4k Frame to 192x192x3 using vision-camera-resize-plugin
//     const resized = resize(frame, {
//       scale: {
//         width: 192,
//         height: 192,
//       },
//       pixelFormat: 'rgb',
//       dataType: 'float32',
//     })

//     // print(resized)
//     // 2. Run model with given input buffer synchronously
//     const THRESHOLD = 0.9;
//     const [palmLocations, _palmScores] = model.runSync([resized])
//     // let palmLocations: Float32Array = Float32Array.from(_palmLocations, sigmoid);
//     const palmScores: Float32Array = Float32Array.from(_palmScores, sigmoid)

//     let best_palms: { id: number, score: number | bigint }[] = [];
//     let boxes: Box[] = [];
//     let hand_detected = false;


//     for (let i = 0; i < palmScores.length; i++) {
//         if (palmScores[i] >= THRESHOLD) {
//           best_palms.push({
//             id: i,
//             score: palmScores[i],
//           });
//         }
//     }
//     // print(`Found ${best_palms.length} palms with score above ${THRESHOLD}`);
//     best_palms = best_palms
//       .sort((a, b) => Number(b.score) - Number(a.score))
//       .slice(0, 1)

//     for (let i = 0; i < best_palms.length; i++) {
//       const palmId = best_palms[i].id;
//       const palmScore = best_palms[i].score;
//       const palmLocation: DecodedPalm = getPalmDecoded(palmLocations, palmId, anchors);

//       // print(palmLocations.length / palmScores.length)
//       // print(`===== Palm ID: ${palmId} ${Math.floor(100 * palmLocation[0])} ${Math.floor(100 * palmLocation[1])} =====`)
//       // for (let j = 0; j < 18; j++) {
//       //   print(palmLocation[j])
//       //   boxes.push({
//       //     id: palmId + j,
//       //     left: palmLocation[j] * frame.width * 0.5,
//       //     top: j * 15,
//       //     width: 10,
//       //     height: 10,
//       //   });
//       // }



//       // hand_detected = true;
//       const palmX = palmLocation.centerX * frame.width;
//       const palmY = palmLocation[6] * frame.height;
//       const palmWidth = palmLocation[2] * frame.width;
//       const palmHeight = palmLocation[3] * frame.height;

//       boxes.push({
//           id: palmId,
//           left: palmX,
//           top: 0,
//           width: 10,
//           height: 10,
//         });

//     }
//     updateBox(boxes);

//     // if (hand_detected && 0) {
//     //   // print("oh")
//     //   const resized = resize(frame, {
//     //     scale: {
//     //       width: 224,
//     //       height: 224,
//     //     },
//     //     pixelFormat: 'rgb',
//     //     dataType: 'float32',
//     //   })

//     //   const [norm_landmarks, handiness, hand_side, world_landmarks] = model2.runSync([resized]);
//     //   // print(norm_landmarks);
//     //   // print(handiness);
//     //   print((hand_side[0] > 0.5) ? "Left Hand" : "Right Hand");
//     //   // print((hand_side[0] < 0.5) ? "Left Hand" : "Right Hand");
//     //   // print(world_landmarks);
//     // }

//     // updateBox(boxes);
//     // print(`Detected ${best_palms.length} palms with score above ${THRESHOLD}`)
//     // // print('Top 2 palms:', best_palms[0], best_palms[1]);
//     // // print("Outputs:", outputs)
//     // for (let i = 0; i < best_palms.length; i++) {
//     //   const palmId = best_palms[i].id;
//     //   const palmScore = best_palms[i].score;
//     //   // const palmLocation = palmLocations[palmId];
//     //   const step = palmLocations.length / palmScores.length;
//     //   const start_index = palmId * step
//     //   // print(palmLocations.length / palmScores.length)
//     //   print(`===== Palm ID: ${palmId} =====`)
//     //   for (let j = 0; j < step; j++) {
//     //     print(palmLocations[palmId + j])
//     //   }

//     // }
//   },
//   [model]
// )
