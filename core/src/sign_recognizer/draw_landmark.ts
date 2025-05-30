import { DataGestures } from "./gestures/data_gestures";
import { HAND_POINTS_FIELDS, HAND_CONNECTIONS } from "./gestures/gestures";

/** Options for customizing the drawing */
export interface DrawOptions {
    pointColor?: string;
    pointSize?: number;
    lineColor?: string;
    lineWidth?: number;
}


// // Hand landmark connections based on Google's Mediapipe Hand Model
// const HAND_CONNECTIONS: [number, number][] = [
//     [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
//     [0, 5], [5, 6], [6, 7], [7, 8], // Index finger
//     [0, 9], [9, 10], [10, 11], [11, 12], // Middle finger
//     [0, 13], [13, 14], [14, 15], [15, 16], // Ring finger
//     [0, 17], [17, 18], [18, 19], [19, 20], // Pinky finger
//     [5, 9], [9, 13], [13, 17] // Palm connections
// ];

/**
 * Draws hand landmarks from Google’s HandLandmarkerResult on a canvas.
 * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context.
 * @param {DataGestures} result - DataGestures detection result.
 * @param {DrawOptions} options - Optional styling options.
 */
export function drawHandLandmarkerResult(
    ctx: CanvasRenderingContext2D,
    result: DataGestures,
    options: DrawOptions = {}
): void {
    if (!result) return;

    // Default styling options
    const {
        pointColor = "red",
        pointSize = 5,
        lineColor = "blue",
        lineWidth = 2,
    } = options;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.fillStyle = pointColor;

    // Draw lines between hand landmarks
    ctx.beginPath();
    for (const [start, end] of HAND_CONNECTIONS) {
        const startLandmark: [number, number, number] | null = result.getFieldData(start);
        const endLandmark: [number, number, number] | null = result.getFieldData(end);

        if (startLandmark && endLandmark) {
            ctx.moveTo(startLandmark[0] * ctx.canvas.width, startLandmark[1] * ctx.canvas.height);
            ctx.lineTo(endLandmark[0] * ctx.canvas.width, endLandmark[1] * ctx.canvas.height);
        }
    }
    ctx.stroke();
    // Draw landmark points
    for (const field of HAND_POINTS_FIELDS) {
        ctx.beginPath();
        const point: [number, number, number] | null = result.getFieldData(field);
        if (!point) continue;
        ctx.arc(point[0] * ctx.canvas.width, point[0] * ctx.canvas.height, pointSize, 0, 2 * Math.PI);
        ctx.fill();
    }
}
