import { createPropBuilder } from '../utils/propBuilder.js';
import { createRoundedVessel } from '../components/createRoundedVessel.js';

export const tankDefaults = { width: 1.4, height: 2.2, depth: 1.4, bodyColor: '#819a9e' };
export function createStorageTank(options = {}) {
  const builder = createPropBuilder('StorageTank', 'container', tankDefaults, options);
  const { root, config: { width: w, height: h, depth: d }, cylinder, box, materials } = builder;
  createRoundedVessel(builder, root, { width: w, depth: d, bottom: h * 0.3, top: h * 0.82, capHeight: h * 0.12 });
  for (const x of [-1, 1]) for (const z of [-1, 1]) {
    box(root, `SupportLeg${x}_${z}`, [w * 0.06, h * 0.3, d * 0.06], [x * w * 0.25, h * 0.15, z * d * 0.25], materials.steelDark);
    box(root, `Footplate${x}_${z}`, [w * 0.13, h * 0.015, d * 0.13], [x * w * 0.25, h * 0.0075, z * d * 0.25], materials.steelDark);
  }
  cylinder(root, 'TopManhole', Math.min(w, d) * 0.13, h * 0.08, [0, h * 0.96, 0], materials.steelLight);
  cylinder(root, 'DrainPort', Math.min(w, d) * 0.04, d * 0.12, [0, h * 0.24, d * 0.43], materials.steelDark, 'z');
  return root;
}
