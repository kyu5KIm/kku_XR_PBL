import { createPropBuilder } from '../utils/propBuilder.js';

export const barrelDefaults = { width: 0.58, height: 0.88, depth: 0.58, bodyColor: '#476f8b' };
export function createBarrel(options = {}) {
  const builder = createPropBuilder('Barrel', 'container', barrelDefaults, options);
  const { root, config: { width: w, height: h, depth: d }, cylinder, torus, group, materials } = builder;
  // 단면만 조정하여 너비와 깊이가 다른 용기도 지원한다. Root는 단위 스케일을 유지한다.
  const shell = group(root, 'DrumShell');
  const body = cylinder(shell, 'Body', 1, h * 0.96, [0, h / 2, 0], materials.paintedSteel);
  body.scale.set(w / 2, 1, d / 2);
  for (const [name, y] of [['BottomRim', h * 0.01], ['TopRim', h * 0.99]]) {
    const rim = cylinder(shell, name, 1, h * 0.02, [0, y, 0], materials.steelDark);
    rim.scale.set(w / 2, 1, d / 2);
  }
  for (const [index, y] of [h * 0.3, h * 0.7].entries()) {
    const ring = torus(shell, `RollingHoop${index + 1}`, 0.98, 0.02, [0, y, 0], materials.paintedSteel, 'y');
    ring.scale.set(w / 2, d / 2, h * 0.5);
  }
  cylinder(root, 'FillerCap', Math.min(w, d) * 0.07, h * 0.01, [w * 0.23, h * 0.985, 0], materials.steelLight);
  return root;
}
