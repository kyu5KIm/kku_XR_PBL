export function createPipe(builder, parent, { length, radius, y, flangeRadius, flangeThickness }) {
  const pipe = builder.group(parent, 'PipeAssembly');
  builder.cylinder(pipe, 'PipeTube', radius, length - flangeThickness, [0, y, 0], builder.materials.steelLight, 'x');
  for (const side of [-1, 1]) {
    const flange = builder.group(pipe, side < 0 ? 'LeftFlange' : 'RightFlange', [side * (length - flangeThickness) / 2, y, 0]);
    builder.cylinder(flange, 'FlangePlate', flangeRadius, flangeThickness, [0, 0, 0], builder.materials.steelDark, 'x');
    for (let index = 0; index < 8; index++) {
      const angle = index * Math.PI / 4;
      builder.cylinder(flange, `Bolt${index + 1}`, flangeRadius * 0.07, flangeThickness * 0.3,
        [side * flangeThickness * 0.3, Math.cos(angle) * flangeRadius * 0.78, Math.sin(angle) * flangeRadius * 0.78], builder.materials.steelLight, 'x');
    }
  }
  return pipe;
}
