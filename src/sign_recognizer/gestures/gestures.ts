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
}

const FIELDS: string[] = Object.keys(new Gestures());
const FIELD_DIMENSION: number = 3

export { Gestures, FIELDS, FIELD_DIMENSION };
