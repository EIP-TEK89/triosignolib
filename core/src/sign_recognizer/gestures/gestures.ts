/**
  * Gestures class that refer all possible points.
  */
class Gestures<T> {
  // Left hand data
  l_hand_position: T | null = null;
  l_wrist: T | null = null;
  l_thumb_cmc: T | null = null;
  l_thumb_mcp: T | null = null;
  l_thumb_ip: T | null = null;
  l_thumb_tip: T | null = null;
  l_index_mcp: T | null = null;
  l_index_pip: T | null = null;
  l_index_dip: T | null = null;
  l_index_tip: T | null = null;
  l_middle_mcp: T | null = null;
  l_middle_pip: T | null = null;
  l_middle_dip: T | null = null;
  l_middle_tip: T | null = null;
  l_ring_mcp: T | null = null;
  l_ring_pip: T | null = null;
  l_ring_dip: T | null = null;
  l_ring_tip: T | null = null;
  l_pinky_mcp: T | null = null;
  l_pinky_pip: T | null = null;
  l_pinky_dip: T | null = null;
  l_pinky_tip: T | null = null;

  // Right hand data
  r_hand_position: T | null = null;
  r_wrist: T | null = null;
  r_thumb_cmc: T | null = null;
  r_thumb_mcp: T | null = null;
  r_thumb_ip: T | null = null;
  r_thumb_tip: T | null = null;
  r_index_mcp: T | null = null;
  r_index_pip: T | null = null;
  r_index_dip: T | null = null;
  r_index_tip: T | null = null;
  r_middle_mcp: T | null = null;
  r_middle_pip: T | null = null;
  r_middle_dip: T | null = null;
  r_middle_tip: T | null = null;
  r_ring_mcp: T | null = null;
  r_ring_pip: T | null = null;
  r_ring_dip: T | null = null;
  r_ring_tip: T | null = null;
  r_pinky_mcp: T | null = null;
  r_pinky_pip: T | null = null;
  r_pinky_dip: T | null = null;
  r_pinky_tip: T | null = null;

  l_hand_velocity: T | null = null;
  r_hand_velocity: T | null = null;

  // MID FACE SET
  m_nose_point: T | null = null  // Middle nose point
  m_top_nose: T | null = null  // Middle Top nose
  m_eyebrows: T | null = null  // Middle of eyebrows
  m_forehead: T | null = null  // Middle forehead
  m_top_chin: T | null = null  // Top chin
  m_bot_up_lip: T | null = null  // Bottom upper lip
  m_top_low_lip: T | null = null  // Top lower lip
  m_bot_nose: T | null = null  // Bottom nose
  m_chin: T | null = null  // Middle chin
  m_nose: T | null = null  // Middle nose

  // LEFT FACE SET
  l_eye_exterior: T | null = null  // Left eye exterior
  l_temple: T | null = null  // Left temple
  l_mid_chin: T | null = null  // Left middle chin
  l_up_lip: T | null = null  // Left upper lip
  l_ext_nostril: T | null = null  // Exterior left nostril
  l_mid_cheek: T | null = null  // Middle left cheek
  l_mid_eyebrow: T | null = null  // Middle left eyebrow
  l_ext_eyebrow: T | null = null  // Left exterior eyebrow
  l_ext_lips: T | null = null  // Exterior left lips
  l_jaw_angle: T | null = null  // Left jaw angle
  l_mid_ext_face: T | null = null  // Left middle exterior face
  l_int_eyebrow: T | null = null  // Interor left eyebrow
  l_mid_jaw: T | null = null  // Middle left jaw
  l_mid_bot_eyelid: T | null = null  // Left eye middle bottom eyelid
  l_ext_mouth: T | null = null  // Left exterior mouth
  l_top_eyelid: T | null = null  // Left eye middle top eyelid
  l_eye_int: T | null = null  // Left eye interior
  l_pupil: T | null = null  // Left pupil

  // RIGHT FACE SET
  r_eye_exterior: T | null = null  // Right eye exterior
  r_temple: T | null = null  // Right temple
  r_mid_chin: T | null = null  // Right middle chin
  r_up_lip: T | null = null  // Right upper lip
  r_ext_nostril: T | null = null  // Exterior right nostril
  r_mid_cheek: T | null = null  // Middle right cheek
  r_mid_eyebrow: T | null = null  // Middle right eyebrow
  r_ext_eyebrow: T | null = null  // Right exterior eyebrow
  r_ext_lips: T | null = null  // Exterior right lips
  r_jaw_angle: T | null = null  // Right jaw angle
  r_mid_ext_face: T | null = null  // Right middle exterior face
  r_int_eyebrow: T | null = null  // Interor right eyebrow
  r_mid_jaw: T | null = null  // Middle right jaw
  r_mid_bot_eyelid: T | null = null  // Right eye middle bottom eyelid
  r_ext_mouth: T | null = null  // Right exterior mouth
  r_top_eyelid: T | null = null  // Right eye middle top eyelid
  r_eye_int: T | null = null  // Right eye interior
  r_pupil: T | null = null  // Right pupil

  l_shoulder: T | null = null  // Left shoulder
  l_elbow: T | null = null  // Left elbow
  l_hip: T | null = null  // Left hip
  l_knee: T | null = null  // Left knee
  l_ankle: T | null = null  // Left ankle
  l_body_wrist: T | null = null  // Left wrist, used for body gestures

  r_shoulder: T | null = null  // Right shoulder
  r_elbow: T | null = null  // Right elbow
  r_hip: T | null = null  // Right hip
  r_knee: T | null = null  // Right knee
  r_ankle: T | null = null  // Right ankle
  r_body_wrist: T | null = null  // Right wrist, used for body gestures

  m_face_position: T | null = null  // Middle face position
  m_body_position: T | null = null  // Middle body position
  m_face_scale: T | null = null  // Middle face scale
  m_body_scale: T | null = null  // Middle body scale
  l_hand_scale: T | null = null  // Left hand scale
  r_hand_scale: T | null = null  // Right hand scale

  constructor(init?: Partial<Gestures<T>>) {
    if (init) {
      const knownFields = new Set(Object.keys(this));

      // Validate that all fields in `init` exist in the class
      Object.keys(init).forEach(key => {
        if (!knownFields.has(key)) {
          throw new Error(`Unknown field "${key}" provided to Gestures<T> constructor`);
        }
      });

      // Assign valid properties
      Object.assign(this, init);
    }
  }

  getFieldData(field: string): T | null {
    if (this.hasOwnProperty(field)) {
      return (this as any)[field] as T | null;
    } else {
      throw new Error(`Field "${field}" does not exist in Gestures class.`);
    }
  }

  setFieldData(field: string, value: T | null): void {
    if (this.hasOwnProperty(field)) {
      (this as any)[field] = value;
    } else {
      throw new Error(`Field "${field}" does not exist in Gestures class.`);
    }
  }
}

/**
 * Array with the names every fields of Gestures class.
 */
const FIELDS: string[] = Object.keys(new Gestures());
/**
 * Number of dimensions of each field in the Gestures class.
 */
const FIELD_DIMENSION: number = 3



const LEFT_HAND_POINTS_FIELDS: string[] = [
  "l_wrist", "l_thumb_cmc", "l_thumb_mcp", "l_thumb_ip", "l_thumb_tip",
  "l_index_mcp", "l_index_pip", "l_index_dip", "l_index_tip",
  "l_middle_mcp", "l_middle_pip", "l_middle_dip", "l_middle_tip",
  "l_ring_mcp", "l_ring_pip", "l_ring_dip", "l_ring_tip",
  "l_pinky_mcp", "l_pinky_pip", "l_pinky_dip", "l_pinky_tip"
];
const RIGHT_HAND_POINTS_FIELDS: string[] = [
  "r_wrist", "r_thumb_cmc", "r_thumb_mcp", "r_thumb_ip", "r_thumb_tip",
  "r_index_mcp", "r_index_pip", "r_index_dip", "r_index_tip",
  "r_middle_mcp", "r_middle_pip", "r_middle_dip", "r_middle_tip",
  "r_ring_mcp", "r_ring_pip", "r_ring_dip", "r_ring_tip",
  "r_pinky_mcp", "r_pinky_pip", "r_pinky_dip", "r_pinky_tip"
]
const HAND_POINTS_FIELDS: string[] = [...LEFT_HAND_POINTS_FIELDS, ...RIGHT_HAND_POINTS_FIELDS]

const HAND_CONNECTIONS: [string, string][] = [
  ["l_wrist", "l_thumb_cmc"],
  ["l_thumb_cmc", "l_thumb_mcp"],
  ["l_thumb_mcp", "l_thumb_ip"],
  ["l_thumb_ip", "l_thumb_tip"],
  ["l_wrist", "l_index_mcp"],
  ["l_index_mcp", "l_index_pip"],
  ["l_index_pip", "l_index_dip"],
  ["l_index_dip", "l_index_tip"],
  ["l_wrist", "l_middle_mcp"],
  ["l_middle_mcp", "l_middle_pip"],
  ["l_middle_pip", "l_middle_dip"],
  ["l_middle_dip", "l_middle_tip"],
  ["l_wrist", "l_ring_mcp"],
  ["l_ring_mcp", "l_ring_pip"],
  ["l_ring_pip", "l_ring_dip"],
  ["l_ring_dip", "l_ring_tip"],
  ["l_wrist", "l_pinky_mcp"],
  ["l_pinky_mcp", "l_pinky_pip"],
  ["l_pinky_pip", "l_pinky_dip"],
  ["l_pinky_dip", "l_pinky_tip"],

  ["r_wrist", "r_thumb_cmc"],
  ["r_thumb_cmc", "r_thumb_mcp"],
  ["r_thumb_mcp", "r_thumb_ip"],
  ["r_thumb_ip", "r_thumb_tip"],
  ["r_wrist", "r_index_mcp"],
  ["r_index_mcp", "r_index_pip"],
  ["r_index_pip", "r_index_dip"],
  ["r_index_dip", "r_index_tip"],
  ["r_wrist", "r_middle_mcp"],
  ["r_middle_mcp", "r_middle_pip"],
  ["r_middle_pip", "r_middle_dip"],
  ["r_middle_dip", "r_middle_tip"],
  ["r_wrist", "r_ring_mcp"],
  ["r_ring_mcp", "r_ring_pip"],
  ["r_ring_pip", "r_ring_dip"],
  ["r_ring_dip", "r_ring_tip"],
  ["r_wrist", "r_pinky_mcp"],
  ["r_pinky_mcp", "r_pinky_pip"],
  ["r_pinky_pip", "r_pinky_dip"],
  ["r_pinky_dip", "r_pinky_tip"]
];

const BODY_POINTS_FIELDS: string[] = [
  "l_shoulder", "l_elbow", "l_hip", "l_knee", "l_ankle", "l_body_wrist",
  "r_shoulder", "r_elbow", "r_hip", "r_knee", "r_ankle", "r_body_wrist"
];

const BODY_CONNECTIONS: [string, string][] = [
  ["l_shoulder", "r_shoulder"],
  ["l_hip", "r_hip"],
  ["l_shoulder", "l_hip"],
  ["r_shoulder", "r_hip"],
  ["l_shoulder", "l_elbow"],
  ["l_elbow", "l_body_wrist"],
  ["r_shoulder", "r_elbow"],
  ["r_elbow", "r_body_wrist"],
  ["l_hip", "l_knee"],
  ["l_knee", "l_ankle"],
  ["r_hip", "r_knee"],
  ["r_knee", "r_ankle"]
];

const FACE_POINTS_FIELDS: string[] = [
  "m_nose_point",
  "m_top_nose",
  "m_eyebrows",
  "m_forehead",
  "m_top_chin",
  "m_bot_up_lip",
  "m_top_low_lip",
  "m_bot_nose",
  "m_chin",
  "m_nose",
  "l_eye_exterior",
  "l_temple",
  "l_mid_chin",
  "l_up_lip",
  "l_ext_nostril",
  "l_mid_cheek",
  "l_mid_eyebrow",
  "l_ext_eyebrow",
  "l_ext_lips",
  "l_jaw_angle",
  "l_mid_ext_face",
  "l_int_eyebrow",
  "l_mid_jaw",
  "l_mid_bot_eyelid",
  "l_ext_mouth",
  "l_top_eyelid",
  "l_eye_int",
  "l_pupil",
  "r_eye_exterior",
  "r_temple",
  "r_mid_chin",
  "r_up_lip",
  "r_ext_nostril",
  "r_mid_cheek",
  "r_mid_eyebrow",
  "r_ext_eyebrow",
  "r_ext_lips",
  "r_jaw_angle",
  "r_mid_ext_face",
  "r_int_eyebrow",
  "r_mid_jaw",
  "r_mid_bot_eyelid",
  "r_ext_mouth",
  "r_top_eyelid",
  "r_eye_int",
  "r_pupil",
];

export { Gestures, FIELDS, FIELD_DIMENSION,
  HAND_POINTS_FIELDS,
  HAND_CONNECTIONS,
  LEFT_HAND_POINTS_FIELDS,
  RIGHT_HAND_POINTS_FIELDS,
  BODY_POINTS_FIELDS,
  BODY_CONNECTIONS,
  FACE_POINTS_FIELDS
};
