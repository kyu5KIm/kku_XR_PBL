import { createPropBuilder, integerOption } from '../utils/propBuilder.js';

export const palletDefaults = { width: 1.2, height: 0.15, depth: 1, bodyColor: '#b98c55', boardCount: 5 };
export function createPallet(options = {}) {
  const config = { ...palletDefaults, ...options };
  integerOption(config.boardCount, 'boardCount', 3, 12);
  const builder = createPropBuilder('Pallet', 'logistics', palletDefaults, config);
  const { root, config: { width: w, height: h, depth: d, boardCount }, repeatedBoxes, materials } = builder;
  materials.wood.color.set(config.bodyColor);
  const boardDepth = d / (boardCount + 1);
  const positions = Array.from({ length: boardCount }, (_, index) => [0, h * 0.9, -d / 2 + boardDepth / 2 + index * (d - boardDepth) / (boardCount - 1)]);
  repeatedBoxes(root, 'TopDeckBoards', [w, h * 0.2, boardDepth], positions, materials.wood);
  repeatedBoxes(root, 'BottomRunners', [w * 0.14, h * 0.2, d], [-1, 0, 1].map(side => [side * w * 0.4, h * 0.1, 0]), materials.wood);
  const blocks = [];
  for (const x of [-1, 0, 1]) for (const z of [-1, 0, 1]) blocks.push([x * w * 0.4, h * 0.5, z * d * 0.4]);
  repeatedBoxes(root, 'SupportBlocks', [w * 0.14, h * 0.6, d * 0.16], blocks, materials.wood);
  return root;
}
