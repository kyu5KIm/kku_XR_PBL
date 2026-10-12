// 모델 내부의 공유 리소스를 한 번씩 해제한다. 모델 간에는 리소스를 공유하지 않는다.
export function disposeObject(object) {
  const geometries = new Set();
  const materials = new Set();
  object.traverse((child) => {
    if (child.geometry) geometries.add(child.geometry);
    if (child.material) {
      const entries = Array.isArray(child.material) ? child.material : [child.material];
      entries.forEach((material) => materials.add(material));
    }
    if (child.isInstancedMesh) child.dispose();
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}
