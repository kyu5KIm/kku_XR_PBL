import * as THREE from 'three';
import { sceneConfig } from '../config/sceneConfig.js';

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 100);
  camera.position.set(...sceneConfig.cameraPosition);
  return camera;
}
