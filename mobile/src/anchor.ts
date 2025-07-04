
export type Anchor = {
  center_x: number;
  center_y: number;
  width: number;
  height: number;
};

export type DecodedPalm = {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  rotation: number;
  keypoints: { x: number; y: number }[];
};

export const ssd_anchor = {
  "input_size": 192,
  "num_layers": 4,
  "min_scale": 0.1484375,
  "max_scale": 0.75,
  "strides": [8, 16, 16, 16],
  "anchor_offset_x": 0.5,
  "anchor_offset_y": 0.5,
  "aspect_ratios": [1.0],
  "fixed_anchor_size": true
}

export function generateAnchors({
  inputSize = 192,
  numLayers = 4,
  minScale = 0.1484375,
  maxScale = 0.75,
  strides = [8, 16, 16, 16],
  aspectRatios = [1.0],
  anchorOffsetX = 0.5,
  anchorOffsetY = 0.5,
  fixedAnchorSize = true,
}): Anchor[] {
  const anchors = [];

  for (let layer = 0; layer < numLayers; layer++) {
    const stride = strides[layer];

    // 1️⃣ Calcule le scale pour ce layer
    const scale = minScale + (maxScale - minScale) * (layer / (numLayers - 1));

    // 2️⃣ Taille de la grille pour ce stride
    const featureMapSize = Math.ceil(inputSize / stride);

    for (let y = 0; y < featureMapSize; y++) {
      for (let x = 0; x < featureMapSize; x++) {
        for (const aspectRatio of aspectRatios) {
          const ratioSqrt = Math.sqrt(aspectRatio);

          const anchorHeight = fixedAnchorSize ? scale : scale / ratioSqrt;
          const anchorWidth  = fixedAnchorSize ? scale : scale * ratioSqrt;

          // Center normalisé (entre 0 et 1)
          const centerX = (x + anchorOffsetX) * stride / inputSize;
          const centerY = (y + anchorOffsetY) * stride / inputSize;

          anchors.push({
            center_x: centerX,
            center_y: centerY,
            width: anchorWidth,
            height: anchorHeight,
          });
        }
      }
    }
  }
  const doubleAnchors = anchors.concat(anchors)
  console.log(`Generated ${anchors.length} or ${doubleAnchors.length} anchors for input size ${inputSize}`);

  return doubleAnchors;
}

export const getPalmDecoded = (
  palmLocations: Float32Array,
  index: number,
  anchors: Anchor[]
): DecodedPalm => {
  'worklet';

  const step = 18;
  const start = index * step;

  const anchor = anchors[index];

  // Offsets
  const offset_cx = palmLocations[start + 0];
  const offset_cy = palmLocations[start + 1];
  const w_logit   = palmLocations[start + 2];
  const h_logit   = palmLocations[start + 3];
  const rotation  = palmLocations[start + 4];

  // Decode center
  const centerX = anchor.center_x + offset_cx * anchor.width;
  const centerY = anchor.center_y + offset_cy * anchor.height;

  // Decode size
  const width  = Math.exp(w_logit) * anchor.width;
  const height = Math.exp(h_logit) * anchor.height;

  // Decode keypoints
  const keypoints: { x: number; y: number }[] = [];

  for (let kp = 0; kp < 7; kp++) {
    const kp_x_offset = palmLocations[start + 5 + kp * 2];
    const kp_y_offset = palmLocations[start + 5 + kp * 2 + 1];

    const kp_x = anchor.center_x + kp_x_offset * anchor.width;
    const kp_y = anchor.center_y + kp_y_offset * anchor.height;

    keypoints.push({ x: kp_x, y: kp_y });
  }

  return {
    centerX,
    centerY,
    width,
    height,
    rotation,
    keypoints,
  };
};
