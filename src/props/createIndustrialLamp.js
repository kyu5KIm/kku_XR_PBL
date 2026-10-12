import * as THREE from 'three';
import { createPropBuilder } from '../utils/propBuilder.js';

export const lampDefaults = { width: 0.5, height: 1.6, depth: 0.5, bodyColor: '#497770' };
export function createIndustrialLamp(options = {}) {
  const builder = createPropBuilder('IndustrialLamp', 'lighting', lampDefaults, options);
  const { root, config: { width: w, height: h, depth: d }, cylinder, mesh, materials } = builder;
  const base = cylinder(root, 'StandBase', 1, h * 0.04, [0, h * 0.02, 0], materials.steelDark);
  base.scale.set(w * 0.22, 1, d * 0.22);
  cylinder(root, 'LampPost', Math.min(w, d) * 0.025, h * 0.7, [0, h * 0.39, 0], materials.steelLight);
  const shade = mesh(root, 'ConicalShade', new THREE.ConeGeometry(1, h * 0.28, 24), materials.paintedSteel, [0, h * 0.86, 0]);
  shade.scale.set(w / 2, 1, d / 2);
  const diffuser = cylinder(root, 'Diffuser', 1, h * 0.005, [0, h * 0.725, 0], materials.plasticBlack);
  diffuser.scale.set(w * 0.47, 1, d * 0.47);
  // 설치 조명은 Scene에서 관리한다. 소품 자체에는 조명 객체를 넣지 않는다.
  materials.plasticBlack.color.set(0xffedbd);
  materials.plasticBlack.emissive.set(0xffdda0);
  materials.plasticBlack.emissiveIntensity = 0.3;
  return root;
}
