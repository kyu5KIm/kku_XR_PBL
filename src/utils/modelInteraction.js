import { MathUtils } from 'three';

export function applyModelInteraction(id, model, value) {
  const angle = MathUtils.degToRad(value);
  const { width, depth } = model.userData.dimensions;
  switch (id) {
    case 'distribution-box':
    case 'electrical-cabinet':
      model.getObjectByName('DoorPivot').rotation.y = -angle;
      break;
    case 'steel-cabinet':
      model.getObjectByName('LeftDoorPivot').rotation.y = -angle;
      model.getObjectByName('RightDoorPivot').rotation.y = angle;
      break;
    case 'toolbox':
      model.children.filter(child => /^Drawer\d+$/.test(child.name)).forEach(drawer => { drawer.position.z = depth * 0.65 * value / 100; });
      break;
    case 'valve':
    case 'pipe-valve':
      model.getObjectByName('ValveHandle').rotation.y = angle;
      break;
    case 'conveyor':
      model.getObjectByName('Rollers').children.forEach(roller => { roller.rotation.z = angle; });
      break;
    case 'machine-enclosure':
      model.getObjectByName('DoorSlide').position.x = width * 0.6 * value / 100;
      break;
    case 'factory-decor':
      model.getObjectByName('LidPivot').rotation.x = -angle;
      break;
  }
}
