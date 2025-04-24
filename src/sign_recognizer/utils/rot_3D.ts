export function rot3dX(coord: [number, number, number], angle: number): [number, number, number] {
    const [x, y, z] = coord;
    let new_y = y * Math.cos(angle) - z * Math.sin(angle);
    let new_z = y * Math.sin(angle) + z * Math.cos(angle);
    return [x, new_y, new_z];
}

export function rot3dY(coord: [number, number, number], angle: number): [number, number, number] {
    const [x, y, z] = coord;
    let new_x = x * Math.cos(angle) - z * Math.sin(angle);
    let new_z = x * Math.sin(angle) + z * Math.cos(angle);
    return [new_x, y, new_z];
}

export function rot3dZ(coord: [number, number, number], angle: number): [number, number, number] {
    const [x, y, z] = coord;
    let new_x = x * Math.cos(angle) - y * Math.sin(angle);
    let new_y = x * Math.sin(angle) + y * Math.cos(angle);
    return [new_x, new_y, z];
}
