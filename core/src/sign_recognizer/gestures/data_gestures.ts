import { HandLandmarkerResult, PoseLandmarkerResult, FaceLandmarkerResult, NormalizedLandmark } from '@mediapipe/tasks-vision';

import { Gestures, FIELDS, FIELD_DIMENSION } from "./gestures"
import { HANDS_POINTS, HANDS_POSITION } from "./point_presets"
import { rot3dX, rot3dY, rot3dZ } from "../utils/rot_3D"

const CACHE_HANDS_POINTS: string[] = HANDS_POINTS.getActiveFields()
const CACHE_HANDS_POSITION: string[] = HANDS_POSITION.getActiveFields()

function getFields(valid_fields: string[] | null = null): string[] {
  if (valid_fields === null)
    return FIELDS
  return valid_fields
}

function randFixInterval(limit: number): number {
  return Math.random() * (2 * limit) - limit;
}

function landmarkToList(
  landmark: { x?: number | null; y?: number | null; z?: number | null } | null | undefined
): [number, number, number] | null {
  if (!landmark) return null;
  if (
    (landmark.x === undefined || landmark.x === null) &&
    (landmark.y === undefined || landmark.y === null) &&
    (landmark.z === undefined || landmark.z === null)
  ) {
    return null;
  }
  return [
    landmark.x !== undefined && landmark.x !== null ? landmark.x : 0.0,
    landmark.y !== undefined && landmark.y !== null ? landmark.y : 0.0,
    landmark.z !== undefined && landmark.z !== null ? landmark.z : 0.0,
  ];
}

function getDistBetweenPoints(
  point1: [number | null | undefined, number | null | undefined, number | null | undefined],
  point2: [number | null | undefined, number | null | undefined, number | null | undefined]
): number {
  const point1Full: [number, number, number] = [
    point1[0] != null ? point1[0] : 0.0,
    point1[1] != null ? point1[1] : 0.0,
    point1[2] != null ? point1[2] : 0.0,
  ];
  const point2Full: [number, number, number] = [
    point2[0] != null ? point2[0] : 0.0,
    point2[1] != null ? point2[1] : 0.0,
    point2[2] != null ? point2[2] : 0.0,
  ];
  return Math.sqrt(
    Math.pow(point1Full[0] - point2Full[0], 2) +
    Math.pow(point1Full[1] - point2Full[1], 2) +
    Math.pow(point1Full[2] - point2Full[2], 2)
  );
}

export class DataGestures extends Gestures<[number, number, number] | null> {
  public other_hand_gesture: DataGestures | null = null;
  constructor(init?: Partial<Gestures<[number, number, number] | null>>) {
    super(init);
  }

  static buildFromHandLandmarkerResult(
    landmarkResult: HandLandmarkerResult,
    validFields?: string[]
  ): DataGestures {
    const tmp = new DataGestures();
    tmp.setHandsFromHandLandmarkerResult(landmarkResult, validFields);
    return tmp;
  }

  static from1DArray(array: number[], validFields: string[] = FIELDS): DataGestures {
    const tmp = new DataGestures();
    validFields = getFields(validFields);
    for (let i = 0; i < validFields.length; i++) {
      (tmp as any)[validFields[i]] = array.slice(i * FIELD_DIMENSION, (i + 1) * FIELD_DIMENSION);
    }
    return tmp;
  }

  setHandsFromHandLandmarkerResult(
    landmarkResult: HandLandmarkerResult,
    validFields?: string[]
  ): DataGestures {
    const handFields: string[] = [
      "wrist", // 0
      "thumb_cmc", // 1
      "thumb_mcp", // 2
      "thumb_ip", // 3
      "thumb_tip", // 4
      "index_mcp", // 5
      "index_pip", // 6
      "index_dip", // 7
      "index_tip", // 8
      "middle_mcp", // 9
      "middle_pip", // 10
      "middle_dip", // 11
      "middle_tip", // 12
      "ring_mcp", // 13
      "ring_pip", // 14
      "ring_dip", // 15
      "ring_tip", // 16
      "pinky_mcp", // 17
      "pinky_pip", // 18
      "pinky_dip", // 19
      "pinky_tip", // 20
    ];
    const handPosId = 9;
    const handPosId2 = 0;

    if (!landmarkResult.landmarks) return this;

    for (let i = 0; i < landmarkResult.landmarks.length; i++) {
      const handLandmark: NormalizedLandmark[] = landmarkResult.landmarks[i];
      const prefix = landmarkResult.handedness[i][0].categoryName === "Left" ? "l_" : "r_";

      // Get wrist position and center it
      let handPos = landmarkToList(handLandmark[handPosId]) || [0.0, 0.0, 0.0];

      // Compute scale as the distance between two reference points
      const scale =
        getDistBetweenPoints(
          landmarkToList(handLandmark[handPosId]) || [0, 0, 0],
          landmarkToList(handLandmark[handPosId2]) || [0, 0, 0]
        ) || 1.0;
      this.setPointTo(`${prefix}hand_scale`, scale, scale, scale);

      for (let j = 0; j < handFields.length; j++) {
        let tmp = landmarkToList(handLandmark[j]);
        if (tmp !== null) {
          tmp = [
            (tmp[0] - handPos[0]) / scale,
            (tmp[1] - handPos[1]) / scale,
            (tmp[2] - handPos[2]) / scale,
          ];
        }
        (this as any)[`${prefix}${handFields[j]}`] = tmp;
      }

      this.setPointTo(
        `${prefix}hand_position`,
        handPos[0] - 0.5,
        handPos[1] - 0.5,
        handPos[2] - 0.5
      );
    }
    return this;
  }

  setBodyFromHandLandmarkerResult(
    landmarkResult: PoseLandmarkerResult
  ): DataGestures {
    // console.log("Body landmark:", landmarkResult);

    if (landmarkResult.landmarks === undefined || landmarkResult.landmarks.length === 0) {
      return this;
    }

    const landmarks: NormalizedLandmark[] = landmarkResult.landmarks[0];

    // Map field names to their indices in the poseLandmarks array
    const bodyFields: { [key: string]: number } = {
      l_shoulder: 11,
      l_elbow: 13,
      l_hip: 23,
      l_knee: 25,
      l_ankle: 27,
      l_body_wrist: 15,
      r_shoulder: 12,
      r_elbow: 14,
      r_hip: 24,
      r_knee: 26,
      r_ankle: 28,
      r_body_wrist: 16,
    };
    // console.log("Body fields:", bodyFields);

    let l_shoulder_coord = landmarkToList(landmarks[bodyFields["l_shoulder"]]);
    let r_shoulder_coord = landmarkToList(landmarks[bodyFields["r_shoulder"]]);
    if (!l_shoulder_coord) l_shoulder_coord = [0, 0, 0];
    if (!r_shoulder_coord) r_shoulder_coord = [0, 0, 0];

    // Compute body position as the midpoint between shoulders
    this.m_body_position = [
      (l_shoulder_coord[0] + r_shoulder_coord[0]) / 2,
      (l_shoulder_coord[1] + r_shoulder_coord[1]) / 2,
      (l_shoulder_coord[2] + r_shoulder_coord[2]) / 2,
    ];

    // Compute scale as the distance between shoulders
    const scale =
      getDistBetweenPoints(l_shoulder_coord, r_shoulder_coord) || 1.0;
    (this as any).m_body_scale = [scale, scale, scale];

    // Set each body field, normalized by body position and scale
    for (const key in bodyFields) {
      const idx = bodyFields[key];
      let tmp = landmarkToList(landmarks[idx]);
      if (tmp) {
        tmp = [
          (tmp[0] - this.m_body_position[0]) / scale,
          (tmp[1] - this.m_body_position[1]) / scale,
          (tmp[2] - this.m_body_position[2]) / scale,
        ];
      }
      (this as any)[key] = tmp;
    }

    // Offset body position by -0.5
    this.m_body_position = [
      this.m_body_position[0] - 0.5,
      this.m_body_position[1] - 0.5,
      this.m_body_position[2] - 0.5,
    ];

    return this;
  }

  setFaceFromFaceLandmarkerResult(
    landmarkResult: FaceLandmarkerResult
  ): DataGestures {
    if (landmarkResult.faceLandmarks === undefined || landmarkResult.faceLandmarks.length === 0) {
      return this;
    }
    // Define the mapping from field names to landmark indices
    const faceFields: { [key: string]: number } = {
      m_nose_point: 1, // Middle nose point
      m_top_nose: 6, // Middle Top nose
      m_eyebrows: 9, // Middle of eyebrows
      m_forehead: 10, // Middle forehead
      m_top_chin: 18, // Top chin
      m_bot_up_lip: 13, // Bottom upper lip
      m_top_low_lip: 14, // Top lower lip
      m_bot_nose: 141, // Bottom nose
      m_chin: 152, // Middle chin
      m_nose: 197, // Middle nose
      l_eye_exterior: 7, // Left eye exterior
      l_temple: 21, // Left temple
      l_mid_chin: 32, // Left middle chin
      l_up_lip: 39, // Left upper lip
      l_ext_nostril: 48, // Exterior left nostril
      l_mid_cheek: 50, // Middle left cheek
      l_mid_eyebrow: 52, // Middle left eyebrow
      l_ext_eyebrow: 53, // Left exterior eyebrow
      l_ext_lips: 57, // Exterior left lips
      l_jaw_angle: 58, // Left jaw angle
      l_mid_ext_face: 93, // Left middle exterior face
      l_int_eyebrow: 107, // Interior left eyebrow
      l_mid_jaw: 136, // Middle left jaw
      l_mid_bot_eyelid: 145, // Left eye middle bottom eyelid
      l_ext_mouth: 146, // Left exterior mouth
      l_top_eyelid: 159, // Left eye middle top eyelid
      l_eye_int: 173, // Left eye interior
      l_pupil: 468, // Left pupil
      r_eye_exterior: 359, // Right eye exterior
      r_temple: 251, // Right temple
      r_mid_chin: 262, // Right middle chin
      r_up_lip: 269, // Right upper lip
      r_ext_nostril: 331, // Exterior right nostril
      r_mid_cheek: 280, // Middle right cheek
      r_mid_eyebrow: 283, // Middle right eyebrow
      r_ext_eyebrow: 282, // Right exterior eyebrow
      r_ext_lips: 273, // Exterior right lips
      r_jaw_angle: 288, // Right jaw angle
      r_mid_ext_face: 323, // Right middle exterior face
      r_int_eyebrow: 336, // Interior right eyebrow
      r_mid_jaw: 365, // Middle right jaw
      r_mid_bot_eyelid: 374, // Right eye middle bottom eyelid
      r_ext_mouth: 287, // Right exterior mouth
      r_top_eyelid: 386, // Right eye middle top eyelid
      r_eye_int: 398, // Right eye interior
      r_pupil: 473 // Right pupil
    };

    // Get the face points from the result
    const facePoints: NormalizedLandmark[] = landmarkResult.faceLandmarks[0];

    // Get the coordinates for the nose and chin
    let nosePointCoord = landmarkToList(facePoints[faceFields["m_nose_point"]]);
    let chinCoord = landmarkToList(facePoints[faceFields["m_chin"]]);
    this.m_face_position = nosePointCoord;

    if (!nosePointCoord) nosePointCoord = [0.0, 0.0, 0.0];
    if (!chinCoord) chinCoord = [0.0, 0.0, 0.0];

    // Compute scale as the distance between nose and chin
    const scale =
      getDistBetweenPoints(
      [nosePointCoord[0], nosePointCoord[1], nosePointCoord[2]],
      [chinCoord[0], chinCoord[1], chinCoord[2]]
      ) || 1.0;
    (this as any).m_face_scale = [scale, scale, scale];

    // Set each face field, normalized by nose position and scale
    for (const key in faceFields) {
      const idx = faceFields[key];
      let tmp = landmarkToList(facePoints[idx]);
      if (tmp) {
      tmp = [
        (tmp[0] - nosePointCoord[0]) / scale,
        (tmp[1] - nosePointCoord[1]) / scale,
        (tmp[2] - nosePointCoord[2]) / scale,
      ];
      }
      (this as any)[key] = tmp;
    }

    // Offset face position by -0.5
    if (this.m_face_position) {
      this.m_face_position = [
      this.m_face_position[0] - 0.5,
      this.m_face_position[1] - 0.5,
      this.m_face_position[2] - 0.5,
      ];
    }

    return this;
  }
  setPointTo(pointFieldName: string, x: number, y: number, z: number): DataGestures {
    (this as any)[pointFieldName] = [x, y, z];
    return this;
  }

  setPointToZero(pointFieldName: string): DataGestures {
    return this.setPointTo(pointFieldName, 0, 0, 0);
  }

  setPointToRandom(point: string): DataGestures {
    if (CACHE_HANDS_POSITION.includes(point)) {
      this.setPointTo(point, randFixInterval(1), randFixInterval(1), randFixInterval(1));
    } else {
      this.setPointTo(point, randFixInterval(0.15), randFixInterval(0.15), randFixInterval(0.15));
    }
    return this;
  }

  setAllPointsToZero(): DataGestures {
    FIELDS.forEach(field => this.setPointToZero(field));
    return this;
  }

  setAllPointsToRandom(): DataGestures {
    FIELDS.forEach(field => this.setPointToRandom(field));
    return this;
  }

  setNonePointsToZero(): DataGestures {
    FIELDS.forEach(field => {
      if ((this as any)[field] === null) {
        this.setPointToZero(field);
      }
    });
    return this;
  }

  setNonePointsToRandom(): DataGestures {
    FIELDS.forEach(field => {
      if ((this as any)[field] === null) {
        this.setPointToRandom(field);
      }
    });
    return this;
  }

  setNonePointsRandomlyToRandomOrZero(proba: number = 0.1): DataGestures {
    const noneFields = FIELDS.filter(field => (this as any)[field] === null);

    noneFields.forEach(field => {
      if (Math.random() < proba) {
        (this as any)[field] = [0, 0, 0];
      } else {
        this.setPointToRandom(field);
      }
    });

    return this;
  }

  get1DArray(validFields?: string[]): number[] {
    validFields = getFields(validFields);
    return validFields.flatMap(field => (this as any)[field] || [0, 0, 0]);
  }

  noise(range: number = 0.005, validFields?: string[]): DataGestures {
    validFields = getFields(validFields);
    validFields.forEach(field => {
      let fieldValue = (this as any)[field];
      if (fieldValue) {
        fieldValue[0] += randFixInterval(range);
        fieldValue[1] += randFixInterval(range);
        fieldValue[2] += randFixInterval(range);
      }
    });
    return this;
  }

  mirror(x: boolean = true, y: boolean = false, z: boolean = false): DataGestures {
    FIELDS.forEach(field => {
      let fieldValue = (this as any)[field];
      if (fieldValue) {
        if (x) fieldValue[0] *= -1;
        if (y) fieldValue[1] *= -1;
        if (z) fieldValue[2] *= -1;
      }
    });

    let nx = x ? 1 : 0;
    let ny = y ? 1 : 0;
    let nz = z ? 1 : 0;

    if ((nx + ny + nz) % 2 === 1) {
      this.swapHands();
    }
    return this;
  }

  rotate(x: number = 0, y: number = 0, z: number = 0, validFields?: string[]): DataGestures {
    getFields(validFields).forEach(field => {
      let fieldValue = (this as any)[field];
      if (fieldValue) {
        fieldValue = rot3dX(fieldValue, x);
        fieldValue = rot3dY(fieldValue, y);
        fieldValue = rot3dZ(fieldValue, z);
        (this as any)[field] = fieldValue;
      }
    });
    return this;
  }

  scale(x: number = 1, y: number = 1, z: number = 1, validFields?: string[]): DataGestures {
    getFields(validFields).forEach(field => {
      let fieldValue = (this as any)[field];
      if (fieldValue) {
        fieldValue[0] *= x;
        fieldValue[1] *= y;
        fieldValue[2] *= z;
      }
    });
    return this;
  }

  translate(x: number = 0, y: number = 0, z: number = 0, validFields?: string[]): DataGestures {
    getFields(validFields).forEach(field => {
      let fieldValue = (this as any)[field];
      if (fieldValue) {
        fieldValue[0] += x;
        fieldValue[1] += y;
        fieldValue[2] += z;
      }
    });
    return this;
  }

  swapHands(): DataGestures {
    FIELDS.forEach(field => {
      if (field.startsWith("l_") || field.startsWith("r_")) {
        const oppositeField = field.replace(/^l_/, "temp_").replace(/^r_/, "l_").replace(/^temp_/, "r_");
        [this[field as keyof this], this[oppositeField as keyof this]] =
          [this[oppositeField as keyof this], this[field as keyof this]];
      }
    });
    return this;
  }

  moveToOneSide(rightSide: boolean = true): DataGestures {
    const destSide = rightSide ? "r_" : "l_";
    const srcSide = rightSide ? "l_" : "r_";

    FIELDS.forEach(fieldName => {
      if (fieldName.startsWith(srcSide)) {
        const srcSideVal = (this as any)[fieldName] as [number, number, number] | null;
        const oppositeFieldName = fieldName.replace(srcSide, destSide);

        if ((this as any)[oppositeFieldName] === null) {
          if (srcSideVal !== null) {
            srcSideVal[0] *= -1; // Flip X axis
            srcSideVal[2] *= -1; // Flip Z axis
          }
          (this as any)[oppositeFieldName] = srcSideVal;
          (this as any)[fieldName] = null; // Clear the original side
        }
      }
    });

    return this;
  }

  mergeDataGestures(other: DataGestures): DataGestures {
    FIELDS.forEach(field => {
      const thisValue: [number, number, number] | null = (this as any)[field];
      const otherValue: [number, number, number] | null = (other as any)[field];
      if (!thisValue) {
        this.setFieldData(field, otherValue);
      }
    });
    return this;
  }

  copy(): DataGestures {
    const newDataGestures = new DataGestures();
    FIELDS.forEach(field => {
      const thisValue: [number, number, number] | null = (this as any)[field];
      // Deep copy the array to avoid shared references
      const copiedValue = thisValue ? [thisValue[0], thisValue[1], thisValue[2]] as [number, number, number] : null;
      newDataGestures.setFieldData(field, copiedValue);
    });

    // Also copy the other_hand_gesture if it exists
    if (this.other_hand_gesture) {
      newDataGestures.other_hand_gesture = this.other_hand_gesture.copy();
    }

    return newDataGestures;
  }
}
