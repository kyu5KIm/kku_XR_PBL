import './style.css';
import { prepareModelForExport } from './utils/exportModel.js';
import { disposeObject } from './utils/disposeObject.js';
import * as THREE from 'three';
import { assetCatalog } from './config/assetCatalog.js';
import { applyModelInteraction } from './utils/modelInteraction.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createScene } from './core/scene.js';
import { createCamera } from './core/camera.js';
import { createRenderer } from './core/renderer.js';
import { sceneConfig } from './config/sceneConfig.js';

const canvas = document.querySelector('#scene');
const scene = createScene();
let activeAsset = assetCatalog[0];
let model;
let activeView = 'perspective';
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
  if (model) setView(activeView);
}).observe(canvas.parentElement);

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});

const form = document.querySelector('#model-form');
const motionInput = document.querySelector('#motion-value');
const motionOutput = document.querySelector('#motion-output');
const status = document.querySelector('#status');
let activeDimensions = { ...activeAsset.defaults };

function setModelMotion() {
  if (!model) return;
  const value = Number(motionInput.value);
  applyModelInteraction(activeAsset.id, model, value);
  motionOutput.value = `${value}${activeAsset.motion?.unit ?? ''}`;
}

function selectAsset(asset) {
  activeAsset = asset;
  document.querySelectorAll('[data-asset]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.asset === asset.id));
  });
  document.querySelector('#geometry-description').textContent = asset.geometryLabel;
  document.querySelector('h1').textContent = asset.label;
  document.querySelector('#asset-description').textContent = asset.description;
  document.querySelector('#asset-name').textContent = asset.id;
  document.querySelector('#asset-number').textContent = String(assetCatalog.indexOf(asset) + 1).padStart(3, '0');
  for (const key of ['width', 'height', 'depth']) {
    const input = form.elements[key];
    input.min = (asset.defaults[key] * 0.5).toFixed(3);
    input.max = (asset.defaults[key] * 2).toFixed(3);
    input.step = 'any';
    input.value = asset.defaults[key];
  }
  form.elements.depth.readOnly = Boolean(asset.lockDiameter);
  form.elements.depth.title = asset.lockDiameter ? '회전대칭 유지를 위해 너비와 같은 지름으로 연동됩니다.' : '';
  form.elements.bodyColor.value = asset.defaults.bodyColor;
  const countInput = form.elements.partCount;
  document.querySelector('#count-setting').hidden = !asset.count;
  countInput.disabled = !asset.count;
  if (asset.count) {
    document.querySelector('#count-label').textContent = asset.count.label;
    Object.assign(countInput, { min: asset.count.min, max: asset.count.max, value: asset.defaults[asset.count.key] });
  }
  document.querySelector('#motion-setting').hidden = !asset.motion;
  motionInput.disabled = !asset.motion;
  motionInput.value = '0';
  motionInput.max = asset.motion?.max ?? 100;
  document.querySelector('#motion-label').textContent = asset.motion?.label ?? '조작';
  document.querySelector('#motion-end').textContent = `${asset.motion?.max ?? 0}${asset.motion?.unit ?? ''}`;
  rebuildModel(asset.defaults);
}

function setView(view = 'perspective') {
  activeView = view;
  const { width, height, depth } = activeDimensions;
  const target = new THREE.Vector3(0, height / 2, 0);
  // 화면 비율과 전체 외곽 치수를 기준으로 모든 소품이 시야에 들어오게 한다.
  const aspect = Math.max(camera.aspect, 0.1);
  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
  const radius = Math.hypot(width, height, depth) / 2;
  const distance = radius / Math.sin(Math.min(verticalFov, horizontalFov) / 2) * 1.3;
  controls.maxDistance = Math.max(15, distance * 3);
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
  const replacement = activeAsset.create(options);
  if (model) {
    scene.remove(model);
    disposeObject(model);
  }
  model = replacement;
  model.userData.assetName = activeAsset.id;
  scene.add(model);
  activeDimensions = { ...options };
  setModelMotion();
  setView();
  const { width, height, depth } = activeDimensions;
  document.querySelector('#dimensions').textContent = `${width.toFixed(2)} × ${height.toFixed(2)} × ${depth.toFixed(2)} m`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const values = new FormData(form);
  try {
    const options = {
      width: Number(values.get('width')), height: Number(values.get('height')),
      depth: Number(values.get('depth')), bodyColor: values.get('bodyColor'),
    };
    if (activeAsset.count) options[activeAsset.count.key] = Number(values.get('partCount'));
    rebuildModel(options);
    status.textContent = '모델 설정을 적용했습니다.';
  } catch (error) {
    status.textContent = `설정 적용 실패: ${error.message}`;
  }
});
motionInput.addEventListener('input', setModelMotion);
document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.view));
});
controls.addEventListener('start', () => {
  document.querySelectorAll('[data-view]').forEach((button) => button.setAttribute('aria-pressed', 'false'));
});
document.querySelector('#reset').addEventListener('click', () => {
  selectAsset(activeAsset);
  status.textContent = '기본 설정으로 복원했습니다.';
});
document.querySelector('#export').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  status.textContent = 'GLB 파일을 준비하고 있습니다…';
  try {
    const exported = prepareModelForExport(model);
    const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
    const data = await new GLTFExporter().parseAsync(exported, { binary: true });
    const url = URL.createObjectURL(new Blob([data], { type: 'model/gltf-binary' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exported.userData.assetName}.glb`;
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

const list = document.querySelector('#asset-list');
const search = document.querySelector('#asset-search');
function renderAssetList() {
  const query = search.value.trim().toLocaleLowerCase();
  const matches = assetCatalog.filter(asset => `${asset.label} ${asset.id} ${asset.description} ${asset.geometryLabel}`.toLocaleLowerCase().includes(query));
  list.replaceChildren();
  for (const asset of matches) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.asset = asset.id;
    button.setAttribute('aria-pressed', String(asset.id === activeAsset.id));
    const title = document.createElement('strong');
    title.textContent = asset.label;
    const geometry = document.createElement('small');
    geometry.textContent = asset.geometryLabel;
    button.append(title, geometry);
    button.addEventListener('click', () => {
      selectAsset(asset);
      status.textContent = `${asset.label} 모델을 선택했습니다.`;
    });
    item.appendChild(button);
    list.appendChild(item);
  }
  document.querySelector('#asset-count').textContent = `${matches.length} / ${assetCatalog.length}`;
  document.querySelector('#empty-list').hidden = matches.length > 0;
}
search.addEventListener('input', renderAssetList);
form.elements.width.addEventListener('input', () => {
  if (activeAsset.lockDiameter) form.elements.depth.value = form.elements.width.value;
});
renderAssetList();
selectAsset(activeAsset);
