import './style.css';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createScene } from './core/scene.js';
import { createCamera } from './core/camera.js';
import { createRenderer } from './core/renderer.js';
import { sceneConfig } from './config/sceneConfig.js';

const canvas = document.querySelector('#scene');
const scene = createScene();
const camera = createCamera();
const renderer = createRenderer(canvas);
const controls = new OrbitControls(camera, canvas);
controls.target.set(...sceneConfig.cameraTarget);
controls.enableDamping = true;
controls.minDistance = 0.5;
controls.maxDistance = 15;
controls.maxPolarAngle = Math.PI / 2 - 0.03;
controls.update();

new ResizeObserver(() => {
  const { width, height } = canvas.parentElement.getBoundingClientRect();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}).observe(canvas.parentElement);

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
