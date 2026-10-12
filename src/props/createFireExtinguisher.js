import * as THREE from 'three';
import { createPropBuilder } from '../utils/propBuilder.js';
import { createRoundedVessel } from '../components/createRoundedVessel.js';

export const extinguisherDefaults = { width: 0.2, height: 0.58, depth: 0.2, bodyColor: '#c84337' };
export function createFireExtinguisher(options = {}) {
  const builder = createPropBuilder('FireExtinguisher', 'safety', extinguisherDefaults, options);
  const { root, config: { width: w, height: h, depth: d }, box, cylinder, mesh, materials } = builder;
  createRoundedVessel(builder, root, { width: w, depth: d, bottom: h * 0.12, top: h * 0.73, capHeight: h * 0.12 });
  cylinder(root, 'ValveNeck', Math.min(w, d) * 0.1, h * 0.08, [0, h * 0.87, 0], materials.steelLight);
  box(root, 'CarryHandle', [w * 0.65, h * 0.04, d * 0.12], [w * 0.1, h * 0.98, 0], materials.plasticBlack);
  box(root, 'HandleSupport', [w * 0.08, h * 0.09, d * 0.12], [-w * 0.15, h * 0.925, 0], materials.steelLight);
  const hoseRadius = Math.min(w, d, h) * 0.035;
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, h * 0.88, d * 0.1), new THREE.Vector3(w * 0.36, h * 0.88, d * 0.15),
    new THREE.Vector3(w * 0.38, h * 0.6, d * 0.15), new THREE.Vector3(w * 0.3, h * 0.25, d * 0.2),
  ]);
  mesh(root, 'DischargeHose', new THREE.TubeGeometry(path, 24, hoseRadius, 8, false), materials.rubberBlack, [0, 0, 0]);
  cylinder(root, 'PressureGauge', Math.min(w, d) * 0.08, d * 0.06, [0, h * 0.91, d * 0.13], materials.steelLight, 'z');
  return root;
}
