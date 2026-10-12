import * as THREE from 'three';
import { createPropBuilder, positiveDimensions } from '../utils/propBuilder.js';

export const latheDefaults = { width: 0.28, height: 0.6, depth: 0.28, bodyColor: '#9ba5a8' };
export function createLathePart(options = {}) {
  const config = positiveDimensions(latheDefaults, options);
  if (Math.abs(config.width - config.depth) > 1e-8) {
    throw new RangeError('A rotationally symmetric part requires equal width and depth');
  }
  const builder = createPropBuilder('SteppedShaft', 'machined-part', latheDefaults, config);
  const { root, mesh, materials } = builder;
  const radius = config.width / 2;
  const h = config.height;
  const profile = [
    [0, 0], [0.6, 0], [0.6, 0.12], [1, 0.12], [1, 0.24],
    [0.55, 0.24], [0.55, 0.7], [0.4, 0.7], [0.4, 0.84], [0.25, 0.84], [0.25, 1], [0, 1],
  ].map(([r, y]) => new THREE.Vector2(r * radius, y * h));
  materials.steelLight.color.set(config.bodyColor);
  const geometry = new THREE.LatheGeometry(profile, 32);
  geometry.normalizeNormals();
  mesh(root, 'LathedSteppedShaft', geometry, materials.steelLight, [0, 0, 0]);
  return root;
}
