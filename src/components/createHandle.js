export function createHandle(builder, parent, { x, y, z, length, thickness, reach, name = 'Handle' }) {
  const handle = builder.group(parent, name, [x, y, z]);
  for (const side of [-1, 1]) {
    builder.box(handle, side < 0 ? 'LowerMount' : 'UpperMount', [thickness, thickness, reach], [0, side * length / 2, reach / 2], builder.materials.steelLight);
  }
  builder.box(handle, 'Grip', [thickness, length + thickness, thickness], [0, 0, reach - thickness / 2], builder.materials.plasticBlack);
  return handle;
}
