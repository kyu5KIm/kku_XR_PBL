import * as THREE from 'three';

export function createRoundedVessel(builder, parent, { width, depth, bottom, top, capHeight, name = 'Vessel' }) {
  const vessel = builder.group(parent, name);
  const body = builder.cylinder(vessel, 'CylinderBody', 1, top - bottom, [0, (bottom + top) / 2, 0], builder.materials.paintedSteel);
  body.scale.set(width / 2, 1, depth / 2);
  const capGeometry = new THREE.SphereGeometry(1, 24, 12);
  for (const [partName, y] of [['LowerDome', bottom], ['UpperDome', top]]) {
    const cap = builder.mesh(vessel, partName, capGeometry, builder.materials.paintedSteel, [0, y, 0]);
    cap.scale.set(width / 2, capHeight, depth / 2);
  }
  return vessel;
}
