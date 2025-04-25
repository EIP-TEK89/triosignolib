/**
 * Rotates a 3D coordinate around the X axis by a given angle.
 * @param coord - The 3D coordinate to rotate, represented as a tuple [x, y, z].
 * @param angle - The angle in radians to rotate the coordinate.
 * @returns The rotated 3D coordinate as a tuple [x', y', z'].
 */
export function rot3dX(coord: [number, number, number], angle: number): [number, number, number] {
  const [x, y, z] = coord;
  let new_y = y * Math.cos(angle) - z * Math.sin(angle);
  let new_z = y * Math.sin(angle) + z * Math.cos(angle);
  return [x, new_y, new_z];
}

/**
 * Rotates a 3D coordinate around the Y axis by a given angle.
 * @param coord - The 3D coordinate to rotate, represented as a tuple [x, y, z].
 * @param angle - The angle in radians to rotate the coordinate.
 * @returns The rotated 3D coordinate as a tuple [x', y', z'].
 */
export function rot3dY(coord: [number, number, number], angle: number): [number, number, number] {
  const [x, y, z] = coord;
  let new_x = x * Math.cos(angle) - z * Math.sin(angle);
  let new_z = x * Math.sin(angle) + z * Math.cos(angle);
  return [new_x, y, new_z];
}

/**
 * Rotates a 3D coordinate around the X axis by a given angle.
 * @param coord - The 3D coordinate to rotate, represented as a tuple [x, y, z].
 * @param angle - The angle in radians to rotate the coordinate.
 * @returns The rotated 3D coordinate as a tuple [x', y', z'].
 */
export function rot3dZ(coord: [number, number, number], angle: number): [number, number, number] {
  const [x, y, z] = coord;
  let new_x = x * Math.cos(angle) - y * Math.sin(angle);
  let new_y = x * Math.sin(angle) + y * Math.cos(angle);
  return [new_x, new_y, z];
}
