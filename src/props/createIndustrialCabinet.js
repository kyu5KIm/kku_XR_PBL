import * as THREE from 'three';
import { createIndustrialMaterials } from '../materials/industrialMaterials.js';

export const cabinetDefaults = Object.freeze({
  width: 1.2,
  height: 2,
  depth: 0.4,
  bodyColor: '#657d75',
});

export function createIndustrialCabinet(options = {}) {
  const config = { ...cabinetDefaults, ...options };
  for (const key of ['width', 'height', 'depth']) {
    if (!Number.isFinite(config[key]) || config[key] <= 0) {
      throw new RangeError(`${key} must be a finite positive number in meters`);
    }
  }
  const { width, height, depth, bodyColor } = config;
  const materials = createIndustrialMaterials(bodyColor);
  const cabinet = new THREE.Group();
  cabinet.name = 'ElectricalCabinet';
  cabinet.userData = {
    type: 'industrial-prop', category: 'electrical', assetName: 'control-cabinet',
    units: 'meters', dimensions: { width, height, depth },
    dimensionNote: 'Closed model envelope, including the signal tower and handle',
  };
  const wall = Math.min(width, height, depth) * 0.05;
  const baseHeight = height * 0.05;
  const bodyTop = height * 0.86;
  const bodyHeight = bodyTop - baseHeight;
  const handleReach = depth * 0.12;
  const frontZ = depth / 2 - handleReach;
  const backZ = -depth / 2;
  const bodyDepth = frontZ - backZ;
  const bodyCenterZ = (frontZ + backZ) / 2;
  const gap = wall * 0.3;
  const doorWidth = width - wall * 2 - gap * 2;
  const doorHeight = bodyHeight - wall * 2 - gap * 2;
  const doorCenterY = baseHeight + bodyHeight / 2;

  const box = (parent, name, size, position, material, castShadow = true) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const body = new THREE.Group();
  body.name = 'Body';
  cabinet.add(body);
  box(body, 'Plinth', [width, baseHeight, bodyDepth], [0, baseHeight / 2, bodyCenterZ], materials.steelDark);
  box(body, 'BackPanel', [width, bodyHeight, wall], [0, doorCenterY, backZ + wall / 2], materials.paintedSteel);
  for (const [side, direction] of [['Left', -1], ['Right', 1]]) {
    box(body, `${side}Wall`, [wall, bodyHeight, bodyDepth], [direction * (width - wall) / 2, doorCenterY, bodyCenterZ], materials.paintedSteel);
  }
  for (const [name, y] of [['TopPanel', bodyTop - wall / 2], ['BottomPanel', baseHeight + wall / 2]]) {
    box(body, name, [width - wall * 2, wall, bodyDepth], [0, y, bodyCenterZ], materials.paintedSteel);
  }
  box(body, 'MountingPlate', [width * 0.85, bodyHeight * 0.85, wall * 0.5], [0, doorCenterY, backZ + wall * 1.5], materials.steelLight);

  const doorPivot = new THREE.Group();
  doorPivot.name = 'DoorPivot';
  doorPivot.position.set(-doorWidth / 2, doorCenterY, frontZ - wall / 2);
  cabinet.add(doorPivot);
  box(doorPivot, 'CabinetDoor', [doorWidth, doorHeight, wall], [doorWidth / 2, 0, 0], materials.paintedSteel);

  const handle = new THREE.Group();
  handle.name = 'Handle';
  doorPivot.add(handle);
  const handleX = doorWidth * 0.9;
  const handleLength = doorHeight * 0.15;
  const handleThickness = Math.min(doorWidth * 0.035, handleLength * 0.15);
  for (const direction of [-1, 1]) {
    box(handle, `HandleMount${direction < 0 ? 'Bottom' : 'Top'}`,
      [handleThickness, handleThickness, handleReach],
      [handleX, direction * handleLength / 2, wall / 2 + handleReach / 2], materials.steelLight, false);
  }
  box(handle, 'HandleGrip', [handleThickness, handleLength + handleThickness, handleThickness],
    [handleX, 0, wall / 2 + handleReach - handleThickness / 2], materials.plasticBlack, false);

  // 환기구는 표면 디테일이며 실제 관통 구멍이 아니다. 반복 슬롯을 한 드로우 콜로 묶는다.
  const ventRows = 6;
  const ventGeometry = new THREE.BoxGeometry(doorWidth * 0.38, doorHeight * 0.009, wall * 0.15);
  const vents = new THREE.InstancedMesh(ventGeometry, materials.plasticBlack, ventRows * 2);
  vents.name = 'VentSlots';
  const transform = new THREE.Object3D();
  for (let region = 0; region < 2; region++) {
    for (let row = 0; row < ventRows; row++) {
      transform.position.set(doorWidth * 0.5, (region ? -1 : 1) * doorHeight * 0.3 + row * doorHeight * 0.022, wall * 0.575);
      transform.updateMatrix();
      vents.setMatrixAt(region * ventRows + row, transform.matrix);
    }
  }
  vents.instanceMatrix.needsUpdate = true;
  doorPivot.add(vents);

  const lights = new THREE.Group();
  lights.name = 'WarningLights';
  lights.position.set(width * 0.3, bodyTop, bodyCenterZ);
  cabinet.add(lights);
  const radius = Math.min(width * 0.045, depth * 0.17);
  const poleHeight = height * 0.04;
  const cylinder = (name, geometry, material, y) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.y = y;
    lights.add(mesh);
  };
  cylinder('SignalPole', new THREE.CylinderGeometry(radius * 0.35, radius * 0.35, poleHeight, 12), materials.steelDark, poleHeight / 2);
  const lensHeight = height * 0.03;
  const lensGeometry = new THREE.CylinderGeometry(radius, radius, lensHeight, 16);
  for (const [index, name, material] of [[0, 'Green', materials.safetyGreen], [1, 'Yellow', materials.safetyYellow], [2, 'Red', materials.safetyRed]]) {
    cylinder(name, lensGeometry, material, poleHeight + lensHeight * (index + 0.5));
  }
  const capHeight = height * 0.01;
  cylinder('SignalCap', new THREE.CylinderGeometry(radius, radius, capHeight, 16), materials.plasticBlack, poleHeight + lensHeight * 3 + capHeight / 2);
  return cabinet;
}
