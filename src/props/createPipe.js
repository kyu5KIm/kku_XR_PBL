import { createPropBuilder } from '../utils/propBuilder.js';
import { createPipe as createPipeComponent } from '../components/createPipe.js';

export const pipeDefaults = { width: 1.5, height: 0.32, depth: 0.32, bodyColor: '#839a9e' };
export function createPipe(options = {}) {
  const builder = createPropBuilder('Pipe', 'piping', pipeDefaults, options);
  const { root, config: { width: w, height: h, depth: d } } = builder;
  const section = createPipeComponent(builder, root, { length: w, radius: 0.3, y: 0.5, flangeRadius: 0.5, flangeThickness: w * 0.025 });
  section.scale.set(1, h, d);
  return root;
}
