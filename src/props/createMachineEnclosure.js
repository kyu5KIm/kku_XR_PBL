import { createPropBuilder } from '../utils/propBuilder.js';
import { createHandle } from '../components/createHandle.js';

export const machineDefaults = { width: 2, height: 1.9, depth: 1.1, bodyColor: '#70938b' };
export function createMachineEnclosure(options = {}) {
  const builder = createPropBuilder('MachineEnclosure', 'machinery', machineDefaults, options);
  const { root, config: { width: w, height: h, depth: d }, box, group, cylinder, materials } = builder;
  const wall = Math.min(w, h, d) * 0.035;
  const front = d * 0.44;
  const frame = group(root, 'MachineFrame');
  box(frame, 'Base', [w, h * 0.22, d * 0.94], [0, h * 0.11, -d * 0.03], materials.steelDark);
  box(frame, 'BackPanel', [w, h * 0.78, wall], [0, h * 0.61, -d / 2 + wall / 2]);
  for (const side of [-1, 1]) box(frame, `SidePanel${side}`, [wall, h * 0.78, d * 0.94], [side * (w - wall) / 2, h * 0.61, -d * 0.03]);
  box(frame, 'Roof', [w, wall, d * 0.94], [0, h - wall / 2, -d * 0.03]);
  box(frame, 'FixedFrontPanel', [w * 0.25, h * 0.78, wall], [w * 0.375, h * 0.61, front - wall / 2]);
  const door = group(root, 'DoorSlide');
  box(door, 'DoorPanel', [w * 0.7, h * 0.73, wall], [-w * 0.12, h * 0.59, front - wall / 2]);
  // 창을 불투명 표면으로 표현해 투명 재질의 정렬 문제와 추가 비용을 줄인다.
  box(door, 'InspectionWindow', [w * 0.48, h * 0.36, wall * 0.2], [-w * 0.12, h * 0.64, front + wall * 0.1], materials.plasticBlack);
  createHandle(builder, door, { x: w * 0.18, y: h * 0.57, z: front, length: h * 0.15, thickness: wall * 0.5, reach: d * 0.06 });
  const controls = group(root, 'OperatorPanel');
  box(controls, 'Screen', [w * 0.14, h * 0.13, wall * 0.2], [w * 0.375, h * 0.73, front + wall * 0.1], materials.plasticBlack);
  cylinder(controls, 'EmergencyStopButton', Math.min(w, h) * 0.025, wall * 0.5, [w * 0.375, h * 0.51, front + wall * 0.25], materials.safetyRed, 'z');
  box(root, 'InteriorBed', [w * 0.7, h * 0.06, d * 0.65], [-w * 0.1, h * 0.25, -d * 0.06], materials.steelLight);
  cylinder(root, 'Spindle', Math.min(w, d) * 0.055, h * 0.27, [-w * 0.1, h * 0.64, -d * 0.13], materials.steelLight);
  return root;
}
