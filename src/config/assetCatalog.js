import { createWorkbench, workbenchDefaults } from '../props/createWorkbench.js';
import { createToolbox, toolboxDefaults } from '../props/createToolbox.js';
import { createCabinet, storageCabinetDefaults } from '../props/createCabinet.js';
import { createBarrel, barrelDefaults } from '../props/createBarrel.js';
import { createPipeValve, pipeValveDefaults } from '../props/createPipeValve.js';
import { createIndustrialCabinet, cabinetDefaults } from '../props/createIndustrialCabinet.js';
import { createSafetyFence, fenceDefaults } from '../props/createSafetyFence.js';
import { createPallet, palletDefaults } from '../props/createPallet.js';
import { createConveyor, conveyorDefaults } from '../props/createConveyor.js';
import { createIndustrialRack, rackDefaults } from '../props/createIndustrialRack.js';
import { createMachineEnclosure, machineDefaults } from '../props/createMachineEnclosure.js';
import { createFactoryDecor, decorDefaults } from '../props/createFactoryDecor.js';

export const assetCatalog = [
  { id: 'workbench', label: '산업용 작업대', description: '목재 상판 · 철제 프레임 · 하부 선반', create: createWorkbench, defaults: workbenchDefaults },
  { id: 'toolbox', label: '공구함', description: '이동식 공구함 · 다단 서랍 · 캐스터', create: createToolbox, defaults: toolboxDefaults,
    count: { key: 'drawerCount', label: '서랍 수', min: 2, max: 10 }, motion: { label: '서랍 인출', max: 100, unit: '%' } },
  { id: 'steel-cabinet', label: '철제 캐비닛', description: '양문 수납장 · 내부 선반 · 힌지 도어', create: createCabinet, defaults: storageCabinetDefaults, motion: { label: '도어 개방', max: 110, unit: '°' } },
  { id: 'barrel', label: '드럼통', description: '원통 몸체 · 보강 링 · 주입구', create: createBarrel, defaults: barrelDefaults },
  { id: 'pipe-valve', label: '파이프 및 밸브', description: '플랜지 배관 · 지지대 · 핸드휠 밸브', create: createPipeValve, defaults: pipeValveDefaults, motion: { label: '밸브 회전', max: 360, unit: '°' } },
  { id: 'electrical-cabinet', label: '전기 제어반', description: '도어 · 환기구 · 3단 상태등', create: createIndustrialCabinet, defaults: cabinetDefaults, motion: { label: '도어 개방', max: 110, unit: '°' } },
  { id: 'safety-fence', label: '안전 펜스', description: '철제 기둥 · 와이어 메시 · 고정 받침', create: createSafetyFence, defaults: fenceDefaults },
  { id: 'pallet', label: '팔레트', description: '목재 상판 · 지지 블록 · 하부 러너', create: createPallet, defaults: palletDefaults, count: { key: 'boardCount', label: '상판 수', min: 3, max: 12 } },
  { id: 'conveyor', label: '컨베이어', description: '롤러 · 측면 레일 · 구동부 · 지지 프레임', create: createConveyor, defaults: conveyorDefaults,
    count: { key: 'rollerCount', label: '롤러 수', min: 4, max: 40 }, motion: { label: '롤러 회전', max: 360, unit: '°' } },
  { id: 'industrial-rack', label: '산업용 랙', description: '철제 기둥 · 크로스 빔 · 다단 선반', create: createIndustrialRack, defaults: rackDefaults, count: { key: 'shelfCount', label: '선반 수', min: 2, max: 8 } },
  { id: 'machine-enclosure', label: '기계 설비 외형', description: '가공기 외함 · 슬라이딩 도어 · 작업 베드', create: createMachineEnclosure, defaults: machineDefaults, motion: { label: '슬라이딩 도어', max: 100, unit: '%' } },
  { id: 'factory-decor', label: '공장 내부 장식용 Prop', description: '폐기물함 · 개폐식 덮개 · 안전 콘', create: createFactoryDecor, defaults: decorDefaults, motion: { label: '덮개 개방', max: 100, unit: '°' } },
];
