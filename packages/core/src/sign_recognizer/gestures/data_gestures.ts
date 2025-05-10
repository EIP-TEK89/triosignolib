import { HandLandmarkerResult } from '@mediapipe/tasks-vision';

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

export class DataGestures extends Gestures<[number, number, number] | null> {
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
      "wrist", "thumb_cmc", "thumb_mcp", "thumb_ip", "thumb_tip",
      "index_mcp", "index_pip", "index_dip", "index_tip",
      "middle_mcp", "middle_pip", "middle_dip", "middle_tip",
      "ring_mcp", "ring_pip", "ring_dip", "ring_tip",
      "pinky_mcp", "pinky_pip", "pinky_dip", "pinky_tip"
    ];

    for (let i = 0; i < landmarkResult.worldLandmarks.length; i++) {
      const handLandmark = landmarkResult.landmarks[i];
      const handWorldLandmark = landmarkResult.worldLandmarks[i];

      if (landmarkResult.handedness[i][0].categoryName === "Right") {
        if (!validFields || validFields.includes("r_hand_position")) {
          this.r_hand_position = [handLandmark[0].x - 0.5, handLandmark[0].y - 0.5, handLandmark[0].z - 0.5];
        }

        handFields.forEach((field, j) => {
          if (!validFields || validFields.includes(`r_${field}`)) {
            // Negate X and Z axis otherwise the model recognize sign only when they are done with the back of the hand is shown
            // I am unable to tell if this difference is due to the language difference or a bug before or after this point
            (this as any)[`r_${field}`] = [-handWorldLandmark[j].x, handWorldLandmark[j].y, -handWorldLandmark[j].z];
          }
        });
      } else {
        if (!validFields || validFields.includes("l_hand_position")) {
          this.l_hand_position = [handLandmark[0].x, handLandmark[0].y, handLandmark[0].z];
        }

        handFields.forEach((field, j) => {
          if (!validFields || validFields.includes(`l_${field}`)) {
            // Negate X and Z axis otherwise the model recognize sign only when they are done with the back of the hand is shown
            // I am unable to tell if this difference is due to the language difference or a bug before or after this point
            (this as any)[`l_${field}`] = [-handWorldLandmark[j].x, handWorldLandmark[j].y, -handWorldLandmark[j].z];
          }
        });
      }
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
}
