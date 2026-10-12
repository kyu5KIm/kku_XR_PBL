import { createPropBuilder } from '../utils/propBuilder.js';

export const decorDefaults = { width: 1.1, height: 0.9, depth: 0.55, bodyColor: '#476b59' };
export function createFactoryDecor(options = {}) {
  const builder = createPropBuilder('FactoryDecor', 'decoration', decorDefaults, options);
  const { root, config: { width: w, height: h, depth: d }, box, cylinder, group, materials } = builder;
  const bin = group(root, 'WasteBin', [-w * 0.25, 0, 0]);
  box(bin, 'BinBody', [w * 0.46, h * 0.91, d * 0.9], [0, h * 0.455, 0]);
  const lid = group(bin, 'LidPivot', [0, h * 0.955, -d / 2]);
  box(lid, 'BinLid', [w * 0.5, h * 0.09, d], [0, 0, d / 2], materials.steelDark);
  box(bin, 'Pedal', [w * 0.2, h * 0.025, d * 0.08], [0, h * 0.025, d * 0.46], materials.steelLight);
  const cone = group(root, 'SafetyCone', [w * 0.3, 0, 0]);
  box(cone, 'ConeBase', [w * 0.4, h * 0.04, d * 0.65], [0, h * 0.02, 0], materials.rubberBlack);
  const radius = Math.min(w * 0.17, d * 0.28);
  const coneHeight = h * 0.7;
  const coneStart = h * 0.04;
  cylinder(cone, 'ConeBody', radius, coneHeight, [0, coneStart + coneHeight / 2, 0], materials.safetyYellow, 'y', radius * 0.08);
  // 띠를 별도 절두원뿔로 만들며 같은 기울기를 유지한다.
  const lowerRadius = radius * (1 - 0.92 * 0.55);
  const upperRadius = radius * (1 - 0.92 * 0.7);
  cylinder(cone, 'ReflectiveBand', lowerRadius * 1.01, coneHeight * 0.15, [0, coneStart + coneHeight * 0.625, 0], materials.steelLight, 'y', upperRadius * 1.01);
  return root;
}
