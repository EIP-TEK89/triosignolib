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
}

/**
 * Array with the names every fields of Gestures class.
 */
const FIELDS: string[] = Object.keys(new Gestures());
/**
 * Number of dimensions of each field in the Gestures class.
 */
const FIELD_DIMENSION: number = 3

const HAND_POINTS_FIELDS: string[] = [
  "l_wrist", "l_thumb_cmc", "l_thumb_mcp", "l_thumb_ip", "l_thumb_tip",
  "l_index_mcp", "l_index_pip", "l_index_dip", "l_index_tip",
  "l_middle_mcp", "l_middle_pip", "l_middle_dip", "l_middle_tip",
  "l_ring_mcp", "l_ring_pip", "l_ring_dip", "l_ring_tip",
  "l_pinky_mcp", "l_pinky_pip", "l_pinky_dip", "l_pinky_tip",
  "r_wrist", "r_thumb_cmc", "r_thumb_mcp", "r_thumb_ip", "r_thumb_tip",
  "r_index_mcp", "r_index_pip", "r_index_dip", "r_index_tip",
  "r_middle_mcp", "r_middle_pip", "r_middle_dip", "r_middle_tip",
  "r_ring_mcp", "r_ring_pip", "r_ring_dip", "r_ring_tip",
  "r_pinky_mcp", "r_pinky_pip", "r_pinky_dip", "r_pinky_tip",
];

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

export { Gestures, FIELDS, FIELD_DIMENSION, HAND_POINTS_FIELDS, HAND_CONNECTIONS };
