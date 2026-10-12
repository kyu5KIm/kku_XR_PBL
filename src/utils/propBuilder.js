import * as THREE from 'three';
import { createIndustrialMaterials } from '../materials/industrialMaterials.js';

export function positiveDimensions(defaults, options) {
  const config = { ...defaults, ...options };
  for (const field of ['width', 'height', 'depth']) {
    if (!Number.isFinite(config[field]) || config[field] <= 0) {
      throw new RangeError(`${field} must be a finite positive number in meters`);
    }
  }
  return config;
}

export function integerOption(value, name, min, max) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${name} must be an integer between ${min} and ${max}`);
  }
  return value;
}

export function createPropBuilder(name, category, defaults, options = {}) {
  const config = positiveDimensions(defaults, options);
  const root = new THREE.Group();
  root.name = name;
  root.userData = {
    type: 'industrial-prop', category, assetName: name,
    units: 'meters', dimensions: { width: config.width, height: config.height, depth: config.depth },
    dimensionNote: 'Nominal closed model envelope; example dimensions, not certified specifications',
  };
  const materials = createIndustrialMaterials(config.bodyColor);
  const cache = new Map();
  const geometry = (type, values, make) => {
    const key = `${type}:${values.join(',')}`;
    if (!cache.has(key)) cache.set(key, make());
    return cache.get(key);
  };
  const group = (parent, partName, position = [0, 0, 0]) => {
    const part = new THREE.Group();
    part.name = partName;
    part.position.set(...position);
    parent.add(part);
    return part;
  };
  const mesh = (parent, partName, shape, material, position, rotation = [0, 0, 0]) => {
    const part = new THREE.Mesh(shape, material);
    part.name = partName;
    part.position.set(...position);
    part.rotation.set(...rotation);
    part.castShadow = true;
    part.receiveShadow = true;
    parent.add(part);
    return part;
  };
  const box = (parent, partName, size, position, material = materials.paintedSteel) =>
    mesh(parent, partName, geometry('box', size, () => new THREE.BoxGeometry(...size)), material, position);
  const cylinder = (parent, partName, radius, length, position, material = materials.steelLight, axis = 'y', topRadius = radius) => {
    const rotation = axis === 'x' ? [0, 0, Math.PI / 2] : axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0];
    const args = [topRadius, radius, length, 24];
    return mesh(parent, partName, geometry('cylinder', args, () => new THREE.CylinderGeometry(...args)), material, position, rotation);
  };
  const torus = (parent, partName, radius, tube, position, material = materials.steelLight, axis = 'z') => {
    const args = [radius, tube, 8, 24];
    const rotation = axis === 'y' ? [Math.PI / 2, 0, 0] : axis === 'x' ? [0, Math.PI / 2, 0] : [0, 0, 0];
    return mesh(parent, partName, geometry('torus', args, () => new THREE.TorusGeometry(...args)), material, position, rotation);
  };
  const repeatedBoxes = (parent, partName, size, positions, material = materials.paintedSteel) => {
    const shape = geometry('box', size, () => new THREE.BoxGeometry(...size));
    const instances = new THREE.InstancedMesh(shape, material, positions.length);
    instances.name = partName;
    instances.castShadow = true;
    instances.receiveShadow = true;
    const transform = new THREE.Object3D();
    positions.forEach((position, index) => {
      transform.position.set(...position);
      transform.updateMatrix();
      instances.setMatrixAt(index, transform.matrix);
    });
    instances.instanceMatrix.needsUpdate = true;
    parent.add(instances);
    return instances;
  };
  return { root, config, materials, group, box, cylinder, torus, repeatedBoxes };
}
