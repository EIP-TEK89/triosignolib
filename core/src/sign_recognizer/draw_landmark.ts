import { DataGestures } from "./gestures/data_gestures";
import {
    LEFT_HAND_POINTS_FIELDS,
    RIGHT_HAND_POINTS_FIELDS,
    HAND_CONNECTIONS,
    BODY_POINTS_FIELDS,
    BODY_CONNECTIONS,
    FACE_POINTS_FIELDS
} from "./gestures/gestures";

// Define the type for a 3D point and a 2D point
export type Point3D = [number, number, number];
export type Point2D = [number, number];

// Define the type for connections between points
type Connection = [string, string];

// Simple perspective projection
export function project3DTo2D(
    x: number,
    y: number,
    z: number,
    scale: number = 10000
): Point2D {
    const factor = scale / (z + 5);
    const x2d = x * factor;
    const y2d = -y * factor;
    return [x2d, y2d];
}

type DrawLineFunc = (p1: Point2D, d1: number, p2: Point2D, d2: number) => void;
type DrawPointFunc = (p: Point2D, d: number) => void;

export function drawSelectedPoint(
    gestures: DataGestures,
    drawLineFunc: DrawLineFunc,
    drawPointFunc: DrawPointFunc,
    position: Point3D,
    scale: Point3D,
    points: string[],
    connections: Connection[]
): void {
    const pointsDict: Record<string, Point2D> = {};
    const depthsDict: Record<string, number> = {};

    for (const field of points) {
        const gestureValue = (gestures as any)[field] as Point3D | undefined;
        if (gestureValue) {
            const transformed: Point3D = [
                gestureValue[0] * scale[0] + position[0],
                gestureValue[1] * scale[1] + position[1],
                gestureValue[2] * scale[2] + position[2]
            ];
            pointsDict[field] = [transformed[0], transformed[1]];
            depthsDict[field] = transformed[2];
        }
    }

    for (const connection of connections) {
        if (pointsDict[connection[0]] && pointsDict[connection[1]]) {
            drawLineFunc(
                pointsDict[connection[0]], depthsDict[connection[0]],
                pointsDict[connection[1]], depthsDict[connection[1]]
            );
        }
    }

    for (const key in pointsDict) {
        drawPointFunc(pointsDict[key], depthsDict[key]);
    }
}

export function drawHandGestures(
    gesture: DataGestures,
    drawLineFunc: DrawLineFunc,
    drawPointFunc: DrawPointFunc,
    drawNormalized: boolean = false
): void {
    let rScale: Point3D = [1.0, 1.0, 1.0];
    let lScale: Point3D = [1.0, 1.0, 1.0];
    let rPos: Point3D = [0.0, 0.0, 0.0];
    let lPos: Point3D = [0.0, 0.0, 0.0];

    if (!drawNormalized) {
        rScale = gesture.r_hand_scale ?? rScale;
        lScale = gesture.l_hand_scale ?? lScale;
        rPos = gesture.r_hand_position ?? rPos;
        lPos = gesture.l_hand_position ?? lPos;
    }

    // Draw right hand
    drawSelectedPoint(
        gesture,
        drawLineFunc,
        drawPointFunc,
        rPos,
        rScale,
        RIGHT_HAND_POINTS_FIELDS,
        HAND_CONNECTIONS
    );
    // Draw left hand
    drawSelectedPoint(
        gesture,
        drawLineFunc,
        drawPointFunc,
        lPos,
        lScale,
        LEFT_HAND_POINTS_FIELDS,
        HAND_CONNECTIONS
    );
}

export function drawBodyGestures(
    gestures: DataGestures,
    drawLineFunc: DrawLineFunc,
    drawPointFunc: DrawPointFunc,
    drawNormalized: boolean = false
): void {
    let scale: Point3D = [1.0, 1.0, 1.0];
    let position: Point3D = [0.0, 0.0, 0.0];
    if (!drawNormalized) {
        scale = gestures.m_body_scale ?? scale;
        position = gestures.m_body_position ?? position;
    }

    drawSelectedPoint(
        gestures,
        drawLineFunc,
        drawPointFunc,
        position,
        scale,
        BODY_POINTS_FIELDS,
        BODY_CONNECTIONS
    );
}

export function drawFaceGestures(
    gestures: DataGestures,
    drawLineFunc: DrawLineFunc,
    drawPointFunc: DrawPointFunc,
    drawNormalized: boolean = false
): void {
    let scale: Point3D = [1.0, 1.0, 1.0];
    let position: Point3D = [0.0, 0.0, 0.0];
    if (!drawNormalized) {
        scale = gestures.m_face_scale ?? scale;
        position = gestures.m_face_position ?? position;
    }

    drawSelectedPoint(
        gestures,
        drawLineFunc,
        drawPointFunc,
        position,
        scale,
        FACE_POINTS_FIELDS,
        []
    );
}

export function drawGestures(
    gestures: DataGestures,
    drawLineFunc: DrawLineFunc,
    drawPointFunc: DrawPointFunc,
    drawNormalized: boolean = false
): void {
    drawHandGestures(gestures, drawLineFunc, drawPointFunc, drawNormalized);
    drawBodyGestures(gestures, drawLineFunc, drawPointFunc, drawNormalized);
    drawFaceGestures(gestures, drawLineFunc, drawPointFunc, drawNormalized);
}
