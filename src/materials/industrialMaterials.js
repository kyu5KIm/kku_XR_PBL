import * as THREE from 'three';

export function createIndustrialMaterials(bodyColor = '#657d75') {
  const standard = (name, parameters) => {
    const material = new THREE.MeshStandardMaterial(parameters);
    material.name = name;
    return material;
  };
  return {
    paintedSteel: standard('PaintedSteel', { color: bodyColor, metalness: 0.45, roughness: 0.5 }),
    steelLight: standard('SteelLight', { color: 0xbac2bf, metalness: 0.8, roughness: 0.35 }),
    steelDark: standard('SteelDark', { color: 0x35403e, metalness: 0.8, roughness: 0.5 }),
    rubberBlack: standard('RubberBlack', { color: 0x202625, metalness: 0, roughness: 0.9 }),
    plasticBlack: standard('PlasticBlack', { color: 0x1b2726, metalness: 0, roughness: 0.5 }),
    safetyRed: standard('SafetyRed', { color: 0xe86153, metalness: 0, roughness: 0.35 }),
    safetyYellow: standard('SafetyYellow', { color: 0xeeb94f, metalness: 0, roughness: 0.35 }),
    safetyGreen: standard('SafetyGreen', { color: 0x62b78a, metalness: 0, roughness: 0.35 }),
  };
}
