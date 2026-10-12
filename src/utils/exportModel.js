import * as THREE from 'three';

export function prepareModelForExport(model) {
  // 다른 엔진의 호환성을 위해 인스턴스를 일반 Mesh로 변환한다.
  // 복제본은 원본 Geometry/Material을 공유하므로 별도로 dispose하지 않는다.
  const exported = model.clone(true);
  const instancedMeshes = [];
  exported.traverse((child) => {
    if (child.isInstancedMesh) instancedMeshes.push(child);
  });
  for (const instances of instancedMeshes) {
    const group = new THREE.Group();
    group.name = instances.name;
    group.position.copy(instances.position);
    group.quaternion.copy(instances.quaternion);
    group.scale.copy(instances.scale);
    group.visible = instances.visible;
    for (let index = 0; index < instances.count; index++) {
      const mesh = new THREE.Mesh(instances.geometry, instances.material);
      mesh.name = `${instances.name}${index + 1}`;
      instances.getMatrixAt(index, mesh.matrix);
      mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
      group.add(mesh);
    }
    instances.parent.add(group);
    instances.removeFromParent();
  }
  return exported;
}
