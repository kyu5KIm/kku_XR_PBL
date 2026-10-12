import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';
import { assetCatalog } from '../src/config/assetCatalog.js';
import { prepareModelForExport } from '../src/utils/exportModel.js';
import { disposeObject } from '../src/utils/disposeObject.js';

// GLTFExporter의 브라우저 FileReader 의존성을 Node Blob API로 충족한다.
class BlobFileReader {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
  async readAsDataURL(blob) {
    this.result = `data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`;
    this.onloadend?.();
  }
}
globalThis.FileReader = BlobFileReader;
const outputDirectory = fileURLToPath(new URL('../public/models/', import.meta.url));
await mkdir(outputDirectory, { recursive: true });
const manifest = [];
for (const asset of assetCatalog) {
  const model = asset.create();
  model.userData.assetName = asset.id;
  try {
    const exported = prepareModelForExport(model);
    const binary = await new GLTFExporter().parseAsync(exported, { binary: true });
    const imported = await new GLTFLoader().parseAsync(binary, '');
    const bounds = new Box3().setFromObject(imported.scene);
    const size = bounds.getSize(new Vector3());
    for (const [axis, dimension] of [['x', 'width'], ['y', 'height'], ['z', 'depth']]) {
      if (Math.abs(size[axis] - asset.defaults[dimension]) > 1e-5) throw new Error(`Incorrect ${dimension}: ${asset.id}`);
    }
    if (Math.abs(bounds.min.y) > 1e-5) throw new Error(`Incorrect floor origin: ${asset.id}`);
    disposeObject(imported.scene);
    const filename = `${asset.id}.glb`;
    await writeFile(`${outputDirectory}/${filename}`, Buffer.from(binary));
    manifest.push({
      id: asset.id, label: asset.label, description: asset.description,
      geometry: asset.geometryLabel, file: filename, units: 'meters', defaults: asset.defaults,
      origin: 'bottom-center', assumption: 'Example dimensions, not certified industrial specifications',
    });
    console.log(`${filename}: ${binary.byteLength} bytes (reload verified)`);
  } finally {
    disposeObject(model);
  }
}
await writeFile(`${outputDirectory}/catalog.json`, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Exported and verified ${manifest.length} assets.`);
