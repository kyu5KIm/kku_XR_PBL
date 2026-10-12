import { createPropBuilder, integerOption } from '../utils/propBuilder.js';

export const rackDefaults = { width: 2.2, height: 2.4, depth: 0.8, bodyColor: '#376780', shelfCount: 4 };
export function createIndustrialRack(options = {}) {
  const config = { ...rackDefaults, ...options };
  integerOption(config.shelfCount, 'shelfCount', 2, 8);
  const builder = createPropBuilder('IndustrialRack', 'storage', rackDefaults, config);
  const { root, config: { width: w, height: h, depth: d, shelfCount }, box, group, repeatedBoxes, materials } = builder;
  const post = Math.min(w, d) * 0.07;
  const frame = group(root, 'UprightFrames');
  for (const x of [-1, 1]) for (const z of [-1, 1]) {
    box(frame, `Upright${x}_${z}`, [post, h, post], [x * (w - post) / 2, h / 2, z * (d - post) / 2]);
  }
  const beamThickness = h * 0.03;
  for (let index = 0; index < shelfCount; index++) {
    const y = h * (0.08 + index * 0.84 / (shelfCount - 1));
    const shelf = group(root, `ShelfLevel${index + 1}`);
    for (const z of [-1, 1]) box(shelf, `CrossBeam${z}`, [w - post * 2, beamThickness, post], [0, y, z * (d - post) / 2], materials.safetyYellow);
    box(shelf, 'Deck', [w - post * 2, beamThickness * 0.3, d - post * 2], [0, y + beamThickness * 0.65, 0], materials.steelLight);
  }
  const holes = [];
  for (const x of [-1, 1]) for (let index = 0; index < 18; index++) holes.push([x * (w - post) / 2, h * (0.06 + index * 0.05), d / 2 - post * 0.01]);
  repeatedBoxes(frame, 'UprightSlots', [post * 0.2, h * 0.012, post * 0.02], holes, materials.steelDark);
  return root;
}
