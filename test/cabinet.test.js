import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createIndustrialCabinet, cabinetDefaults } from '../src/props/createIndustrialCabinet.js';
import { prepareModelForExport } from '../src/utils/exportModel.js';
import { disposeObject } from '../src/utils/disposeObject.js';

function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);
}

for (const dimensions of [cabinetDefaults, { width: 0.4, height: 0.8, depth: 0.2 }, { width: 2.4, height: 3, depth: 1 }]) {
  test(`closed model envelope and floor contact: ${JSON.stringify(dimensions)}`, () => {
    const model = createIndustrialCabinet(dimensions);
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    near(size.x, dimensions.width);
    near(size.y, dimensions.height);
    near(size.z, dimensions.depth);
    near(bounds.min.y, 0);
    near(bounds.getCenter(new THREE.Vector3()).x, 0);
    near(bounds.getCenter(new THREE.Vector3()).z, 0);
    model.traverse((child) => {
      assert.ok(child.name, 'Each part must have a meaningful name');
      assert.ok(child.matrixWorld.elements.every(Number.isFinite));
    });
    const pivot = model.getObjectByName('DoorPivot');
    assert.ok(pivot.position.x < 0);
    pivot.rotation.y = -THREE.MathUtils.degToRad(110);
    const openedBounds = new THREE.Box3().setFromObject(model);
    assert.ok(openedBounds.max.z > bounds.max.z);
    near(openedBounds.min.y, 0);
    disposeObject(model);
  });
}

test('invalid dimensions are rejected before model creation', () => {
  for (const field of ['width', 'height', 'depth']) {
    for (const value of [0, -1, NaN, Infinity, '1', null]) {
      assert.throws(() => createIndustrialCabinet({ [field]: value }), RangeError);
    }
  }
});

test('shared resources are disposed exactly once', () => {
  const model = createIndustrialCabinet();
  const resources = new Map();
  model.traverse((child) => {
    for (const resource of [child.geometry, child.material].filter(Boolean)) {
      if (!resources.has(resource)) {
        resources.set(resource, 0);
        resource.addEventListener('dispose', () => resources.set(resource, resources.get(resource) + 1));
      }
    }
  });
  disposeObject(model);
  for (const count of resources.values()) assert.equal(count, 1);
});

// GLTFExporter는 브라우저 FileReader를 사용한다. Node 검증에서는 Blob API로 대체한다.
class NodeFileReader {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
  async readAsDataURL(blob) {
    const buffer = await blob.arrayBuffer();
    this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`;
    this.onloadend?.();
  }
}

test('GLB round-trip preserves geometry, dimensions and hierarchy', async () => {
  const originalFileReader = globalThis.FileReader;
  globalThis.FileReader = NodeFileReader;
  const model = createIndustrialCabinet();
  try {
    const exported = prepareModelForExport(model);
    let instanceCount = 0;
    exported.traverse((child) => { if (child.isInstancedMesh) instanceCount++; });
    assert.equal(instanceCount, 0);
    assert.equal(model.getObjectByName('VentSlots').count, 12);
    const data = await new GLTFExporter().parseAsync(exported, { binary: true });
    assert.equal(new DataView(data).getUint32(0, true), 0x46546c67);
    const imported = await new GLTFLoader().parseAsync(data, '');
    const bounds = new THREE.Box3().setFromObject(imported.scene);
    const size = bounds.getSize(new THREE.Vector3());
    near(size.x, cabinetDefaults.width);
    near(size.y, cabinetDefaults.height);
    near(size.z, cabinetDefaults.depth);
    near(bounds.min.y, 0);
    assert.ok(imported.scene.getObjectByName('DoorPivot'));
    assert.equal(imported.scene.getObjectByName('VentSlots').children.length, 12);
    disposeObject(imported.scene);
  } finally {
    globalThis.FileReader = originalFileReader;
    disposeObject(model);
  }
});
