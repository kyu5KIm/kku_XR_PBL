import { createPropBuilder, integerOption } from '../utils/propBuilder.js';

export const conveyorDefaults = { width: 2.4, height: 0.85, depth: 0.7, bodyColor: '#527c89', rollerCount: 16 };
export function createConveyor(options = {}) {
  const config = { ...conveyorDefaults, ...options };
  integerOption(config.rollerCount, 'rollerCount', 4, 40);
  const builder = createPropBuilder('Conveyor', 'logistics', conveyorDefaults, config);
  const { root, config: { width: w, height: h, depth: d, rollerCount }, box, cylinder, group, materials } = builder;
  const radius = Math.min(h * 0.035, w / (rollerCount * 2.5));
  const frame = group(root, 'SupportFrame');
  for (const side of [-1, 1]) {
    box(frame, `SideRail${side}`, [w, h * 0.1, d * 0.06], [0, h * 0.9, side * d * 0.47]);
    for (const end of [-1, 1]) {
      box(frame, `Leg${side}_${end}`, [w * 0.035, h * 0.85, d * 0.06], [end * w * 0.4, h * 0.425, side * d * 0.4]);
      box(frame, `Foot${side}_${end}`, [w * 0.065, h * 0.02, d * 0.14], [end * w * 0.4, h * 0.01, side * d * 0.4], materials.rubberBlack);
    }
  }
  for (const end of [-1, 1]) box(frame, `CrossBrace${end}`, [w * 0.025, h * 0.05, d * 0.8], [end * w * 0.4, h * 0.35, 0]);
  const rollers = group(root, 'Rollers');
  for (let index = 0; index < rollerCount; index++) {
    const x = -w * 0.46 + index * w * 0.92 / (rollerCount - 1);
    const pivot = group(rollers, `RollerPivot${index + 1}`, [x, h - radius, 0]);
    cylinder(pivot, 'Roller', radius, d * 0.85, [0, 0, 0], materials.steelLight, 'z');
  }
  box(root, 'DriveMotor', [w * 0.13, h * 0.13, d * 0.12], [w * 0.3, h * 0.65, d * 0.44], materials.steelDark);
  return root;
}
