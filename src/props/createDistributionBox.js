import * as THREE from 'three';
import { createPropBuilder } from '../utils/propBuilder.js';
import { createHandle } from '../components/createHandle.js';

export const distributionDefaults = { width: 0.6, height: 0.8, depth: 0.24, bodyColor: '#a2aaa2' };
export function createDistributionBox(options = {}) {
  const builder = createPropBuilder('DistributionBox', 'electrical', distributionDefaults, options);
  const { root, config: { width: w, height: h, depth: d }, mesh, box, group, repeatedBoxes, materials } = builder;
  const thickness = Math.min(w, h, d) * 0.06;
  const outline = new THREE.Shape();
  outline.moveTo(-w / 2, 0); outline.lineTo(w / 2, 0); outline.lineTo(w / 2, h); outline.lineTo(-w / 2, h); outline.closePath();
  const opening = new THREE.Path();
  opening.moveTo(-w / 2 + thickness, thickness); opening.lineTo(-w / 2 + thickness, h - thickness);
  opening.lineTo(w / 2 - thickness, h - thickness); opening.lineTo(w / 2 - thickness, thickness); opening.closePath();
  outline.holes.push(opening);
  mesh(root, 'ExtrudedHousing', new THREE.ExtrudeGeometry(outline, { depth: d * 0.9, bevelEnabled: false, steps: 1 }), materials.paintedSteel, [0, 0, -d / 2]);
  box(root, 'Backplate', [w - thickness * 2, h - thickness * 2, thickness], [0, h / 2, -d / 2 + thickness / 2]);
  const pivot = group(root, 'DoorPivot', [-w / 2 + thickness, h / 2, d * 0.4 - thickness / 2]);
  const doorWidth = w - thickness * 2;
  box(pivot, 'DoorPanel', [doorWidth, h - thickness * 2, thickness], [doorWidth / 2, 0, 0]);
  createHandle(builder, pivot, { x: doorWidth * 0.85, y: 0, z: thickness / 2, length: h * 0.1, thickness: thickness * 0.5, reach: d * 0.1 });
  repeatedBoxes(root, 'CircuitBreakers', [w * 0.09, h * 0.15, d * 0.16], Array.from({ length: 6 }, (_, index) => [-w * 0.3 + index * w * 0.12, h * 0.6, -d * 0.25]), materials.plasticBlack);
  return root;
}
