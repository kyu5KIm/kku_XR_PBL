import { createPropBuilder } from '../utils/propBuilder.js';

export const fenceDefaults = { width: 2, height: 1.8, depth: 0.35, bodyColor: '#dab74c' };
export function createSafetyFence(options = {}) {
  const builder = createPropBuilder('SafetyFence', 'safety', fenceDefaults, options);
  const { root, config: { width: w, height: h, depth: d }, box, group, repeatedBoxes, materials } = builder;
  const post = Math.min(w * 0.04, d * 0.2);
  const frame = group(root, 'FenceFrame');
  for (const side of [-1, 1]) {
    box(frame, `Upright${side}`, [post, h, post], [side * (w - post) / 2, h / 2, 0]);
    box(frame, `Footplate${side}`, [post * 1.8, h * 0.015, d], [side * (w - post * 1.8) / 2, h * 0.0075, 0], materials.steelDark);
  }
  const span = w - post * 2;
  for (const y of [h * 0.12, h - post / 2]) box(frame, `HorizontalRail${y}`, [span, post, post], [0, y, 0]);
  const mesh = group(root, 'WireMesh');
  const wire = Math.min(w, h, d) * 0.015;
  const verticalCount = Math.min(60, Math.max(4, Math.round(w / 0.1)));
  const horizontalCount = Math.min(50, Math.max(4, Math.round(h / 0.1)));
  repeatedBoxes(mesh, 'VerticalWires', [wire, h * 0.82, wire], Array.from({ length: verticalCount }, (_, i) => [-span / 2 + span * (i + 1) / (verticalCount + 1), h * 0.55, 0]), materials.steelDark);
  repeatedBoxes(mesh, 'HorizontalWires', [span, wire, wire], Array.from({ length: horizontalCount }, (_, i) => [0, h * (0.14 + i * 0.8 / (horizontalCount - 1)), 0]), materials.steelDark);
  return root;
}
