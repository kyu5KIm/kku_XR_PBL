import * as THREE from 'three';
import { createPropBuilder } from '../utils/propBuilder.js';

export const beamDefaults = { width: 0.2, height: 0.3, depth: 2.5, bodyColor: '#697b82' };
export function createIBeam(options = {}) {
  const builder = createPropBuilder('IBeam', 'structural', beamDefaults, options);
  const { root, config: { width: w, height: h, depth: d }, mesh, materials } = builder;
  const flange = h * 0.12;
  const web = w * 0.12;
  const points = [
    [-w / 2, 0], [w / 2, 0], [w / 2, flange], [web / 2, flange],
    [web / 2, h - flange], [w / 2, h - flange], [w / 2, h], [-w / 2, h],
    [-w / 2, h - flange], [-web / 2, h - flange], [-web / 2, flange], [-w / 2, flange],
  ];
  const section = new THREE.Shape();
  points.forEach(([x, y], index) => index ? section.lineTo(x, y) : section.moveTo(x, y));
  section.closePath();
  const geometry = new THREE.ExtrudeGeometry(section, { depth: d, bevelEnabled: false, steps: 1 });
  materials.steelDark.color.set(builder.config.bodyColor);
  mesh(root, 'ExtrudedISection', geometry, materials.steelDark, [0, 0, -d / 2]);
  return root;
}
