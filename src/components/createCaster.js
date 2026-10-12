export function createCaster(builder, parent, { x, z, radius, width, name }) {
  const caster = builder.group(parent, name, [x, radius, z]);
  const axle = builder.group(caster, 'WheelPivot');
  builder.cylinder(axle, 'RubberWheel', radius, width, [0, 0, 0], builder.materials.rubberBlack, 'x');
  builder.cylinder(axle, 'Axle', radius * 0.3, width * 1.1, [0, 0, 0], builder.materials.steelLight, 'x');
  builder.box(caster, 'Fork', [width * 1.4, radius * 0.5, radius], [0, radius * 0.65, 0], builder.materials.steelLight);
  return caster;
}
