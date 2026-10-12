import './style.css';
import { prepareModelForExport } from './utils/exportModel.js';
import { disposeObject } from './utils/disposeObject.js';
import * as THREE from 'three';
import { cabinetDefaults, createIndustrialCabinet } from './props/createIndustrialCabinet.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createScene } from './core/scene.js';
import { createCamera } from './core/camera.js';
import { createRenderer } from './core/renderer.js';
import { sceneConfig } from './config/sceneConfig.js';

const canvas = document.querySelector('#scene');
const scene = createScene();
let cabinet = createIndustrialCabinet();
scene.add(cabinet);
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

const form = document.querySelector('#model-form');
const doorAngle = document.querySelector('#door-angle');
const doorValue = document.querySelector('#door-value');
const status = document.querySelector('#status');
let activeDimensions = { ...cabinetDefaults };

function setDoorAngle() {
  const angle = Number(doorAngle.value);
  cabinet.getObjectByName('DoorPivot').rotation.y = -THREE.MathUtils.degToRad(angle);
  doorValue.value = `${angle}°`;
}

function setView(view = 'perspective') {
  const { width, height, depth } = activeDimensions;
  const target = new THREE.Vector3(0, height / 2, 0);
  // 도어를 열어도 전체 모델이 보이도록 닫힘 외곽 치수에 여유를 둔다.
  const distance = Math.max(width, height, depth) * 2.2;
  const directions = {
    front: [0, 0, 1], back: [0, 0, -1], left: [-1, 0, 0],
    right: [1, 0, 0], top: [0, 1, 0.001], perspective: [1, 0.65, 1.4],
  };
  const direction = new THREE.Vector3(...directions[view]).normalize();
  controls.target.copy(target);
  camera.position.copy(target).addScaledVector(direction, distance);
  // 상단 검증 시점도 허용한다. 지면 아래로는 회전하지 않는다.
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;
  controls.update();
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.view === view));
  });
}

function rebuildModel(options) {
  const replacement = createIndustrialCabinet(options);
  scene.remove(cabinet);
  disposeObject(cabinet);
  cabinet = replacement;
  scene.add(cabinet);
  activeDimensions = { ...options };
  setDoorAngle();
  setView();
  const { width, height, depth } = activeDimensions;
  document.querySelector('#dimensions').textContent = `${width.toFixed(2)} × ${height.toFixed(2)} × ${depth.toFixed(2)} m`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const values = new FormData(form);
  try {
    rebuildModel({
      width: Number(values.get('width')), height: Number(values.get('height')),
      depth: Number(values.get('depth')), bodyColor: values.get('bodyColor'),
    });
    status.textContent = '모델 설정을 적용했습니다.';
  } catch (error) {
    status.textContent = `설정 적용 실패: ${error.message}`;
  }
});
doorAngle.addEventListener('input', setDoorAngle);
document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.view));
});
controls.addEventListener('start', () => {
  document.querySelectorAll('[data-view]').forEach((button) => button.setAttribute('aria-pressed', 'false'));
});
document.querySelector('#reset').addEventListener('click', () => {
  form.reset();
  doorAngle.value = '0';
  rebuildModel(cabinetDefaults);
  status.textContent = '기본 설정으로 복원했습니다.';
});
document.querySelector('#export').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  status.textContent = 'GLB 파일을 준비하고 있습니다…';
  try {
    const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
    const exported = prepareModelForExport(cabinet);
    const data = await new GLTFExporter().parseAsync(exported, { binary: true });
    const url = URL.createObjectURL(new Blob([data], { type: 'model/gltf-binary' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'industrial-cabinet.glb';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    // clone은 원본 Geometry/Material을 공유한다. 여기서는 dispose하지 않는다.
    status.textContent = 'GLB 다운로드를 시작했습니다.';
  } catch (error) {
    status.textContent = `GLB 내보내기 실패: ${error.message}`;
  } finally {
    button.disabled = false;
  }
});

rebuildModel(cabinetDefaults);
