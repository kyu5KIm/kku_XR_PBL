import * as THREE from 'three';

export function addLighting(scene) {
  scene.add(new THREE.HemisphereLight(0xf9fff4, 0x5d6a5d, 2.5));
  const key = new THREE.DirectionalLight(0xfff2dc, 4);
  key.name = 'KeyLight';
  key.position.set(3, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.1, far: 20 });
  key.shadow.normalBias = 0.015;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe2edff, 2);
  fill.position.set(-4, 3, -2);
  scene.add(fill);
}
