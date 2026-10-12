import { createPropBuilder } from '../utils/propBuilder.js';
import { createRoundedVessel } from '../components/createRoundedVessel.js';

export const gasCylinderDefaults = { width: 0.3, height: 1.4, depth: 0.3, bodyColor: '#597781' };
export function createGasCylinder(options = {}) {
  const builder = createPropBuilder('GasCylinder', 'container', gasCylinderDefaults, options);
  const { root, config: { width: w, height: h, depth: d }, cylinder, box, materials } = builder;
  createRoundedVessel(builder, root, { width: w, depth: d, bottom: h * 0.09, top: h * 0.79, capHeight: h * 0.09 });
  cylinder(root, 'ValveStem', Math.min(w, d) * 0.09, h * 0.06, [0, h * 0.9, 0], materials.steelLight);
  for (const side of [-1, 1]) box(root, `ValveGuard${side}`, [w * 0.06, h * 0.12, d * 0.08], [side * w * 0.25, h * 0.94, 0]);
  box(root, 'GuardBridge', [w * 0.56, h * 0.02, d * 0.08], [0, h * 0.99, 0]);
  box(root, 'ValveKnob', [w * 0.3, h * 0.015, d * 0.14], [0, h * 0.93, 0], materials.steelDark);
  return root;
}
