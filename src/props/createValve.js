import { createPropBuilder } from '../utils/propBuilder.js';
import { createValve as createValveComponent } from '../components/createValve.js';

export const valveDefaults = { width: 0.42, height: 0.55, depth: 0.32, bodyColor: '#497e78' };
export function createValve(options = {}) {
  const builder = createPropBuilder('Valve', 'piping', valveDefaults, options);
  const { root, config: { width: w, height: h, depth: d }, cylinder, materials } = builder;
  const radius = Math.min(h * 0.14, d * 0.25, w * 0.15);
  createValveComponent(builder, root, { pipeY: h * 0.25, pipeRadius: radius, height: h, wheelRadius: Math.min(w * 0.38, d * 0.48, h * 0.22) });
  cylinder(root, 'FlowBody', radius, w * 0.9, [0, h * 0.25, 0], materials.paintedSteel, 'x');
  for (const side of [-1, 1]) {
    const flange = cylinder(root, `Flange${side}`, 1, w * 0.05, [side * w * 0.475, h * 0.25, 0], materials.steelDark, 'x');
    // 플랜지 단면을 조절해 바닥 접촉과 전체 깊이를 유지한다.
    flange.scale.set(h * 0.25, 1, d / 2);
  }
  return root;
}
