import { createPropBuilder } from '../utils/propBuilder.js';

export const workbenchDefaults = { width: 1.8, height: 0.9, depth: 0.75, bodyColor: '#446a78' };
export function createWorkbench(options = {}) {
  const builder = createPropBuilder('Workbench', 'workstation', workbenchDefaults, options);
  const { root, config: { width: w, height: h, depth: d }, box, group, materials } = builder;
  const topThickness = h * 0.07;
  const legSize = Math.min(w, d) * 0.07;
  box(root, 'Tabletop', [w, topThickness, d], [0, h - topThickness / 2, 0], materials.wood);
  const frame = group(root, 'SteelFrame');
  for (const x of [-1, 1]) {
    for (const z of [-1, 1]) {
      const legX = x * (w / 2 - legSize);
      const legZ = z * (d / 2 - legSize);
      box(frame, `Leg${x < 0 ? 'Left' : 'Right'}${z < 0 ? 'Back' : 'Front'}`, [legSize, h - topThickness, legSize], [legX, (h - topThickness) / 2, legZ]);
      box(frame, `Foot${x}_${z}`, [legSize * 1.4, h * 0.015, legSize * 1.4], [legX, h * 0.0075, legZ], materials.rubberBlack);
    }
  }
  for (const z of [-1, 1]) box(frame, `Apron${z}`, [w - legSize * 2, h * 0.12, legSize], [0, h * 0.85, z * (d / 2 - legSize)]);
  box(root, 'LowerShelf', [w - legSize * 3, h * 0.025, d - legSize * 3], [0, h * 0.22, 0], materials.steelDark);
  return root;
}
