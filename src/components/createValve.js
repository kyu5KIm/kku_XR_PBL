export function createValve(builder, parent, { pipeY, pipeRadius, height, wheelRadius }) {
  const valve = builder.group(parent, 'Valve');
  builder.cylinder(valve, 'ValveBody', pipeRadius * 1.45, pipeRadius * 3, [0, pipeY, 0], builder.materials.paintedSteel, 'x');
  const wheelTube = Math.min(height * 0.015, wheelRadius * 0.1);
  const wheelY = height - wheelTube;
  builder.cylinder(valve, 'Stem', pipeRadius * 0.22, wheelY - pipeY, [0, (wheelY + pipeY) / 2, 0], builder.materials.steelLight);
  const handle = builder.group(valve, 'ValveHandle', [0, wheelY, 0]);
  builder.torus(handle, 'Handwheel', wheelRadius - wheelTube, wheelTube, [0, 0, 0], builder.materials.safetyRed, 'y');
  for (let index = 0; index < 3; index++) {
    const spoke = builder.box(handle, `Spoke${index + 1}`, [wheelRadius * 1.85, wheelTube, wheelTube], [0, 0, 0], builder.materials.safetyRed);
    spoke.rotation.y = index * Math.PI / 3;
  }
  return valve;
}
