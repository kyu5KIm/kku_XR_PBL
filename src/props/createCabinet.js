import { createPropBuilder } from '../utils/propBuilder.js';
import { createHandle } from '../components/createHandle.js';

export const storageCabinetDefaults = { width: 0.9, height: 1.8, depth: 0.45, bodyColor: '#788797' };
export function createCabinet(options = {}) {
  const builder = createPropBuilder('SteelCabinet', 'storage', storageCabinetDefaults, options);
  const { root, config: { width: w, height: h, depth: d }, box, group, repeatedBoxes, materials } = builder;
  const wall = Math.min(w, d) * 0.04;
  const frontZ = d * 0.4;
  const base = h * 0.035;
  box(root, 'Plinth', [w, base, d * 0.9], [0, base / 2, -d * 0.05], materials.steelDark);
  box(root, 'BackPanel', [w, h - base, wall], [0, (h + base) / 2, -d / 2 + wall / 2]);
  for (const side of [-1, 1]) box(root, `SideWall${side}`, [wall, h - base, d * 0.9], [side * (w - wall) / 2, (h + base) / 2, -d * 0.05]);
  box(root, 'TopPanel', [w, wall, d * 0.9], [0, h - wall / 2, -d * 0.05]);
  repeatedBoxes(root, 'Shelves', [w - wall * 2, wall, d * 0.83], [0.1, 0.32, 0.55, 0.78].map(level => [0, h * level, -d * 0.04]), materials.steelLight);
  const doorWidth = (w - wall * 3) / 2;
  for (const side of [-1, 1]) {
    const pivot = group(root, side < 0 ? 'LeftDoorPivot' : 'RightDoorPivot', [side * (w / 2 - wall), (h + base) / 2, frontZ - wall / 2]);
    const centerX = -side * doorWidth / 2;
    box(pivot, side < 0 ? 'LeftDoor' : 'RightDoor', [doorWidth, h - base - wall * 2, wall], [centerX, 0, 0]);
    createHandle(builder, pivot, { x: -side * doorWidth * 0.86, y: 0, z: wall / 2, length: h * 0.11, thickness: Math.min(w, d) * 0.025, reach: d * 0.1 });
  }
  return root;
}
