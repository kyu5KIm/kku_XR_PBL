import { createPropBuilder } from '../utils/propBuilder.js';
import { createPipe } from '../components/createPipe.js';
import { createValve } from '../components/createValve.js';

export const pipeValveDefaults = { width: 1.5, height: 0.9, depth: 0.45, bodyColor: '#5e8189' };
export function createPipeValve(options = {}) {
  const builder = createPropBuilder('PipeAndValve', 'piping', pipeValveDefaults, options);
  const { root, config: { width: w, height: h, depth: d }, box, materials } = builder;
  const radius = Math.min(d * 0.17, h * 0.1, w * 0.08);
  const pipeY = h * 0.45;
  createPipe(builder, root, { length: w, radius, y: pipeY, flangeRadius: radius * 1.7, flangeThickness: w * 0.025 });
  createValve(builder, root, { pipeY, pipeRadius: radius, height: h, wheelRadius: Math.min(w * 0.12, d * 0.4, h * 0.2) });
  for (const side of [-1, 1]) {
    box(root, `SupportFoot${side}`, [w * 0.14, h * 0.04, d], [side * w * 0.32, h * 0.02, 0], materials.steelDark);
    box(root, `SupportPost${side}`, [w * 0.045, pipeY - radius, d * 0.08], [side * w * 0.32, (pipeY - radius) / 2, 0]);
  }
  return root;
}
