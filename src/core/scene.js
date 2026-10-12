import * as THREE from 'three';
import { sceneConfig } from '../config/sceneConfig.js';
import { addLighting } from './lighting.js';

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(sceneConfig.background);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(sceneConfig.groundSize, sceneConfig.groundSize),
    new THREE.MeshStandardMaterial({ color: 0xe9ede4, roughness: 0.95 }),
  );
  ground.name = 'Ground';
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const grid = new THREE.GridHelper(10, 20, 0xb9c4b3, 0xd2dacb);
  grid.name = 'MeterGrid';
  grid.position.y = 0.001;
  scene.add(grid);
  addLighting(scene);
  return scene;
}
