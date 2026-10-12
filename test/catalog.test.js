import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { assetCatalog } from '../src/config/assetCatalog.js';
import { applyModelInteraction } from '../src/utils/modelInteraction.js';
import { prepareModelForExport } from '../src/utils/exportModel.js';
import { disposeObject } from '../src/utils/disposeObject.js';

const tolerance = 1e-5;
function assertNear(actual, expected) {
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
}
function checkModel(model, expected) {
  assert.ok(model.isGroup);
  assert.deepEqual(model.position.toArray(), [0, 0, 0]);
  assert.deepEqual(model.scale.toArray(), [1, 1, 1]);
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  for (const [axis, key] of [['x', 'width'], ['y', 'height'], ['z', 'depth']]) assertNear(size[axis], expected[key]);
  assertNear(bounds.min.y, 0);
  assertNear(bounds.getCenter(new THREE.Vector3()).x, 0);
  assertNear(bounds.getCenter(new THREE.Vector3()).z, 0);
  model.traverse(child => {
    assert.ok(child.name, 'Every part must be named');
    assert.ok(child.matrixWorld.elements.every(Number.isFinite));
    if (child.isMesh) {
      const position = child.geometry.getAttribute('position');
      assert.ok(position.array.every(Number.isFinite));
      assert.ok(child.material.isMeshStandardMaterial);
    }
  });
}

// Node에서는 브라우저 FileReader 대신 Blob의 표준 데이터 읽기 기능을 사용한다.
class BlobFileReader {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
  async readAsDataURL(blob) {
    this.result = `data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`;
    this.onloadend?.();
  }
}

test('catalog covers the sixteen requested parts and five retained assets', () => {
  assert.equal(assetCatalog.length, 21);
  assert.equal(new Set(assetCatalog.map(asset => asset.id)).size, 21);
  assert.deepEqual(assetCatalog.slice(0, 16).map(asset => asset.label), [
    '산업용 작업대', '철제 캐비닛', '파이프', '밸브', '드럼통', '소화기', '가스통',
    '안전 펜스', '팔레트', '공구함', '배전함', '컨베이어', '산업용 램프',
    '저장 탱크', 'I-Beam', '회전대칭 부품',
  ]);
});

const requiredGeometries = {
  workbench: ['BoxGeometry'], 'steel-cabinet': ['BoxGeometry'], pipe: ['CylinderGeometry'],
  valve: ['CylinderGeometry', 'TorusGeometry'], barrel: ['CylinderGeometry'],
  'fire-extinguisher': ['CylinderGeometry', 'SphereGeometry'], 'gas-cylinder': ['CylinderGeometry', 'SphereGeometry'],
  'safety-fence': ['BoxGeometry'], pallet: ['BoxGeometry'], toolbox: ['BoxGeometry'],
  'distribution-box': ['BoxGeometry', 'ExtrudeGeometry'], conveyor: ['BoxGeometry', 'CylinderGeometry'],
  'industrial-lamp': ['CylinderGeometry', 'ConeGeometry'], 'storage-tank': ['CylinderGeometry', 'SphereGeometry'],
  'i-beam': ['ExtrudeGeometry'], 'lathe-part': ['LatheGeometry'],
};

for (const asset of assetCatalog) {
  if (requiredGeometries[asset.id]) {
    test(`${asset.id}: uses the requested Three.js modeling primitives`, () => {
      const model = asset.create();
      const actualTypes = new Set();
      model.traverse(child => { if (child.geometry) actualTypes.add(child.geometry.type); });
      for (const type of requiredGeometries[asset.id]) assert.ok(actualTypes.has(type), `Missing ${type}`);
      disposeObject(model);
    });
  }
  test(`${asset.id}: default and asymmetric parameter changes preserve envelope and floor origin`, () => {
    for (const dimensions of [asset.defaults, {
      ...asset.defaults, width: asset.defaults.width * 1.15,
      height: asset.defaults.height * 0.9, depth: asset.defaults.depth * (asset.lockDiameter ? 1.15 : 1.1),
    }]) {
      const model = asset.create(dimensions);
      checkModel(model, dimensions);
      disposeObject(model);
    }
  });
  test(`${asset.id}: invalid dimensions are rejected`, () => {
    for (const key of ['width', 'height', 'depth']) {
      for (const value of [0, -1, NaN, Infinity, '1', null]) {
        assert.throws(() => asset.create({ [key]: value }), RangeError);
      }
    }
  });
  if (asset.count) {
    test(`${asset.id}: repetition counts accept limits and reject invalid values`, () => {
      for (const value of [asset.count.min, asset.count.max]) {
        const model = asset.create({ [asset.count.key]: value });
        checkModel(model, asset.defaults);
        disposeObject(model);
      }
      for (const value of [asset.count.min - 1, asset.count.max + 1, 2.5, NaN]) {
        assert.throws(() => asset.create({ [asset.count.key]: value }), RangeError);
      }
    });
  }
  if (asset.motion) {
    test(`${asset.id}: interaction transforms are reversible and finite`, () => {
      const model = asset.create();
      model.updateMatrixWorld(true);
      const original = new Map();
      model.traverse(child => original.set(child.name, child.matrix.toArray()));
      applyModelInteraction(asset.id, model, asset.motion.max);
      model.updateMatrixWorld(true);
      let changed = false;
      model.traverse(child => {
        assert.ok(child.matrix.elements.every(Number.isFinite));
        if (child.matrix.toArray().some((value, index) => Math.abs(value - original.get(child.name)[index]) > tolerance)) changed = true;
      });
      // 360도 회전은 초기 행렬과 같으므로 중간 각도로 다시 확인한다.
      if (!changed) {
        applyModelInteraction(asset.id, model, asset.motion.max / 2);
        model.updateMatrixWorld(true);
        model.traverse(child => {
          if (child.matrix.toArray().some((value, index) => Math.abs(value - original.get(child.name)[index]) > tolerance)) changed = true;
        });
      }
      assert.ok(changed);
      applyModelInteraction(asset.id, model, 0);
      checkModel(model, asset.defaults);
      disposeObject(model);
    });
  }
  test(`${asset.id}: GLB export and reload preserve model geometry and hierarchy`, async () => {
    const originalFileReader = globalThis.FileReader;
    globalThis.FileReader = BlobFileReader;
    const model = asset.create();
    try {
      const exported = prepareModelForExport(model);
      exported.traverse(child => assert.ok(!child.isInstancedMesh));
      const data = await new GLTFExporter().parseAsync(exported, { binary: true });
      assert.equal(new DataView(data).getUint32(0, true), 0x46546c67);
      const imported = await new GLTFLoader().parseAsync(data, '');
      const bounds = new THREE.Box3().setFromObject(imported.scene);
      const size = bounds.getSize(new THREE.Vector3());
      assertNear(size.x, asset.defaults.width);
      assertNear(size.y, asset.defaults.height);
      assertNear(size.z, asset.defaults.depth);
      assertNear(bounds.min.y, 0);
      assert.ok(imported.scene.getObjectByName(model.name));
      disposeObject(imported.scene);
    } finally {
      globalThis.FileReader = originalFileReader;
      disposeObject(model);
    }
  });
}

test('lathed shaft enforces equal diameters for true rotational symmetry', () => {
  const asset = assetCatalog.find(asset => asset.id === 'lathe-part');
  assert.throws(() => asset.create({ width: 0.4, depth: 0.3 }), RangeError);
});
