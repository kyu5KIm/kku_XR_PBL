import { createPropBuilder, integerOption } from '../utils/propBuilder.js';
import { createCaster } from '../components/createCaster.js';

export const toolboxDefaults = { width: 0.8, height: 0.95, depth: 0.5, bodyColor: '#a64c42', drawerCount: 5 };
export function createToolbox(options = {}) {
  const config = { ...toolboxDefaults, ...options };
  integerOption(config.drawerCount, 'drawerCount', 2, 10);
  const builder = createPropBuilder('Toolbox', 'storage', toolboxDefaults, config);
  const { root, config: { width: w, height: h, depth: d, drawerCount }, box, group, materials } = builder;
  const radius = Math.min(h * 0.055, d * 0.14);
  const base = radius * 2;
  box(root, 'Case', [w, h - base, d * 0.94], [0, base + (h - base) / 2, -d * 0.03]);
  box(root, 'TopMat', [w * 0.94, h * 0.012, d * 0.88], [0, h - h * 0.006, -d * 0.03], materials.rubberBlack);
  for (const x of [-1, 1]) for (const z of [-1, 1]) {
    createCaster(builder, root, { x: x * w * 0.4, z: z * d * 0.34, radius, width: w * 0.04, name: `Caster${x}_${z}` });
  }
  const drawerHeight = (h - base) * 0.85 / drawerCount;
  for (let index = 0; index < drawerCount; index++) {
    const drawer = group(root, `Drawer${index + 1}`, [0, base + (h - base) * 0.07 + drawerHeight * (index + 0.5), 0]);
    box(drawer, 'DrawerFront', [w * 0.91, drawerHeight * 0.88, d * 0.02], [0, 0, d * 0.45]);
    box(drawer, 'DrawerPull', [w * 0.7, drawerHeight * 0.09, d * 0.06], [0, drawerHeight * 0.25, d * 0.47], materials.steelLight);
  }
  return root;
}
