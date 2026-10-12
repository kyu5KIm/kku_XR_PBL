# AGENTS.md

## 1. Project Overview

이 프로젝트는 Three.js와 JavaScript/TypeScript를 사용하여  
산업 현장에서 활용할 수 있는 3D 소품 및 설비 오브젝트를 제작하는 프로젝트다.

주요 제작 대상:

- 산업용 작업대
- 공구함
- 철제 캐비닛
- 드럼통
- 파이프 및 밸브
- 전기 제어반
- 안전 펜스
- 팔레트
- 컨베이어
- 산업용 랙
- 기계 설비 외형
- 공장 내부 장식용 Prop

최종 결과물은 다음 용도로 활용할 수 있어야 한다.

- Three.js WebGL 콘텐츠m  n bb 
- XR / Digital Twin 콘텐츠
- 가상 전시장
- 교육용 산업 시뮬레이션
- GLB / glTF Asset
- Unity 등 외부 3D 엔진에서 재사용 가능한 Asset

---

# 2. Primary Goal

이 프로젝트의 핵심 목표는 다음과 같다.

> 단순하고 유지보수 가능한 Three.js 코드를 이용하여  
> 재사용 가능한 산업용 3D Asset을 절차적(Procedural)으로 제작한다.

모델 제작 시 다음 우선순위를 따른다.

1. 정확한 형태
2. 명확한 구조
3. 재사용성
4. 수정 가능성
5. 적절한 성능
6. 현실적인 Material
7. 코드 가독성

과도하게 복잡한 Mesh보다  
단순한 Primitive 조합을 우선한다.

---

# 3. Technology Stack

기본 기술 스택:

- Three.js
- JavaScript ES Modules
- TypeScript 사용 가능
- Vite
- glTF / GLB
- OrbitControls
- GLTFLoader
- DRACOLoader 필요 시 사용

가능하면 다음 구조를 유지한다.

```text
Three.js
+
Vite
+
ES Modules
```

외부 라이브러리는 꼭 필요한 경우에만 추가한다.

---

# 4. Unit Convention

모든 3D 모델은 실제 크기를 기준으로 제작한다.

기본 단위:

```text
1 Three.js Unit = 1 meter
```

예:

```text
1 mm   = 0.001
1 cm   = 0.01
10 cm  = 0.1
1 m    = 1
2 m    = 2
```

예를 들어 산업용 제어반 크기가

```text
Width  : 1200 mm
Height : 2000 mm
Depth  : 400 mm
```

이면 Three.js에서는 다음 값을 사용한다.

```javascript
width = 1.2
height = 2.0
depth = 0.4
```

임의의 비율로 모델링하지 않는다.

---

# 5. Coordinate System

Three.js 기본 좌표계를 따른다.

```text
X : Left / Right
Y : Up / Down
Z : Forward / Back
```

기본적으로:

```text
+Y = Up
```

모델 바닥은 가능한 한

```text
Y = 0
```

에 위치시킨다.

모델 Pivot은 특별한 이유가 없다면 다음 위치를 사용한다.

```text
X = 모델 중앙
Y = 모델 바닥
Z = 모델 중앙
```

즉 모델을 Scene에 배치할 때:

```javascript
object.position.set(x, 0, z)
```

형태로 쉽게 배치할 수 있어야 한다.

---

# 6. Modeling Principles

산업 소품은 가능한 한 Primitive 기반으로 제작한다.

우선 사용하는 Geometry:

```javascript
THREE.BoxGeometry
THREE.CylinderGeometry
THREE.SphereGeometry
THREE.PlaneGeometry
THREE.CapsuleGeometry
THREE.TorusGeometry
```

모델은 다음 방식으로 구성한다.

```text
Primitive
   ↓
Transform
   ↓
Material
   ↓
Group
   ↓
Reusable Component
```

예:

```text
ElectricalCabinet
│
├── Body
├── Door
├── Handle
├── WarningLamp_R
├── WarningLamp_Y
├── WarningLamp_G
└── Vent
```

한 개의 거대한 Geometry로 만들기보다  
의미 있는 부품 단위로 분리한다.

---

# 7. Object Hierarchy

복합 모델은 반드시 `THREE.Group` 또는 `THREE.Object3D`를 사용한다.

예:

```javascript
const cabinet = new THREE.Group();

cabinet.name = 'ElectricalCabinet';
```

하위 오브젝트에도 이름을 지정한다.

```javascript
body.name = 'Body';
door.name = 'Door';
handle.name = 'Handle';
```

Scene Graph를 사람이 이해할 수 있어야 한다.

좋은 예:

```text
ElectricalCabinet
├── Body
├── Door
├── Handle
├── VentTop
├── VentBottom
└── WarningLights
    ├── Red
    ├── Yellow
    └── Green
```

피해야 할 예:

```text
Group
├── Mesh
├── Mesh001
├── Mesh002
├── Mesh003
```

---

# 8. Factory Function Pattern

산업 소품은 가능하면 Factory Function 형태로 만든다.

예:

```javascript
export function createIndustrialCabinet(options = {}) {

    const group = new THREE.Group();

    // build object

    return group;
}
```

사용:

```javascript
const cabinet = createIndustrialCabinet({
    width: 1.2,
    height: 2,
    depth: 0.4
});

scene.add(cabinet);
```

가능하면 모델 생성 함수를 Parameter화한다.

---

# 9. Parameterized Modeling

모델의 주요 수치는 코드 상단 또는 옵션 객체에서 관리한다.

좋은 예:

```javascript
const config = {
    width: 1.2,
    height: 2.0,
    depth: 0.4,

    frameThickness: 0.04,
    doorThickness: 0.03,

    handleWidth: 0.18,
    handleHeight: 0.04
};
```

피해야 할 코드:

```javascript
mesh.position.x = 0.374;
mesh.position.y = 0.823;
mesh.position.z = -0.193;
```

의미를 알 수 없는 Magic Number 사용을 최소화한다.

---

# 10. Material Rules

산업용 모델에는 기본적으로 다음 Material을 우선 사용한다.

```javascript
THREE.MeshStandardMaterial
```

또는

```javascript
THREE.MeshPhysicalMaterial
```

기본적인 Material 표현 기준:

금속:

```javascript
metalness: 0.7 ~ 1.0
roughness: 0.25 ~ 0.7
```

페인트된 금속:

```javascript
metalness: 0.4 ~ 0.7
roughness: 0.35 ~ 0.65
```

플라스틱:

```javascript
metalness: 0
roughness: 0.3 ~ 0.7
```

고무:

```javascript
metalness: 0
roughness: 0.7 ~ 1
```

유리:

필요한 경우에만 `MeshPhysicalMaterial`을 사용한다.

---

# 11. Shared Materials

같은 Material을 여러 Mesh에서 재사용한다.

좋은 예:

```javascript
const steelMaterial = new THREE.MeshStandardMaterial({
    color: 0x666666,
    metalness: 0.8,
    roughness: 0.4
});
```

그리고 여러 Mesh에서:

```javascript
new THREE.Mesh(geometryA, steelMaterial);
new THREE.Mesh(geometryB, steelMaterial);
new THREE.Mesh(geometryC, steelMaterial);
```

Mesh마다 동일한 Material을 새로 만들지 않는다.

---

# 12. Geometry Reuse

반복되는 Geometry도 가능하면 재사용한다.

예:

```javascript
const boltGeometry =
    new THREE.CylinderGeometry(
        0.01,
        0.01,
        0.02,
        12
    );
```

다수의 동일 오브젝트가 필요한 경우:

```text
InstancedMesh
```

사용을 검토한다.

예:

- 볼트
- 나사
- 파이프 브라켓
- 팔레트
- 안전 콘
- 반복 랙
- 반복 박스

---

# 13. Detail Level

산업용 Prop은 다음 3단계 Detail 기준을 고려한다.

## Level 1 — Primary Shape

전체 실루엣.

예:

```text
Cabinet Body
Workbench Frame
Drum Body
Pipe
```

## Level 2 — Structural Detail

형태를 식별하는 구조.

예:

```text
Door
Handle
Frame
Wheel
Valve
Vent
```

## Level 3 — Visual Detail

가까이에서 보이는 Detail.

예:

```text
Bolt
Screw
Label
Warning Light
Panel Line
```

항상

```text
Primary Shape
→ Structural Detail
→ Visual Detail
```

순서로 제작한다.

---

# 14. Avoid Excessive Detail

Web 기반 실시간 콘텐츠라는 점을 항상 고려한다.

다음과 같은 Detail은 Geometry보다 Texture 또는 Normal Map 사용을 고려한다.

- 작은 나사
- 작은 홈
- 미세한 표면 패턴
- 용접 자국
- 금속 긁힘
- 작은 경고 문구

불필요하게 Polygon 수를 증가시키지 않는다.

---

# 15. Segments Rule

Cylinder / Sphere 등의 segment 값을 과도하게 높이지 않는다.

예:

작은 볼트:

```javascript
radialSegments = 8 ~ 12
```

일반 파이프:

```javascript
radialSegments = 12 ~ 24
```

큰 원통:

```javascript
radialSegments = 24 ~ 32
```

특별한 이유 없이:

```javascript
64
128
256
```

등을 사용하지 않는다.

---

# 16. File Structure

기본 프로젝트 구조는 다음을 권장한다.

```text
/
├── AGENTS.md
├── package.json
├── index.html
│
├── public/
│   ├── models/
│   ├── textures/
│   └── hdr/
│
└── src/
    ├── main.js
    │
    ├── core/
    │   ├── scene.js
    │   ├── camera.js
    │   ├── renderer.js
    │   └── lighting.js
    │
    ├── materials/
    │   └── industrialMaterials.js
    │
    ├── props/
    │   ├── createBarrel.js
    │   ├── createWorkbench.js
    │   ├── createCabinet.js
    │   ├── createPipe.js
    │   └── createValve.js
    │
    ├── utils/
    │   ├── geometryUtils.js
    │   └── materialUtils.js
    │
    └── config/
        └── sceneConfig.js
```

---

# 17. Naming Convention

파일:

```text
createWorkbench.js
createCabinet.js
createIndustrialRack.js
```

함수:

```javascript
createWorkbench()
createCabinet()
createIndustrialRack()
```

변수:

```javascript
frameMaterial
doorGeometry
handleMesh
```

명확하고 의미 있는 이름을 사용한다.

다음은 피한다.

```javascript
mesh1
mesh2
obj
thing
temp
a
b
c
```

---

# 18. Model Function Convention

각 Prop은 가능한 한 다음 인터페이스를 따른다.

```javascript
createXXX(options)
```

예:

```javascript
createWorkbench({
    width: 2,
    height: 0.9,
    depth: 0.8
});
```

함수는 반드시:

```javascript
THREE.Object3D
```

또는

```javascript
THREE.Group
```

을 반환한다.

---

# 19. Scene Responsibilities

Prop 제작 파일에서는 다음 요소를 생성하지 않는다.

```text
Renderer
Camera
OrbitControls
Main Lighting
Animation Loop
```

Prop 파일은 모델 생성에만 집중한다.

예:

```text
createWorkbench.js
```

는 Workbench Mesh만 생성한다.

Scene 설정은:

```text
scene.js
main.js
```

등에서 담당한다.

---

# 20. Lighting

모델 확인용 기본 Lighting은 다음 구성을 권장한다.

```text
AmbientLight
+
DirectionalLight
```

또는

```text
HemisphereLight
+
DirectionalLight
```

PBR Material 검증이 중요한 경우:

```text
HDR Environment
```

사용을 고려한다.

Material이 너무 어둡다는 이유로  
Material 색상을 과도하게 밝게 수정하기 전에 Lighting을 확인한다.

---

# 21. Camera

개발용 Scene에서는 기본적으로:

```javascript
PerspectiveCamera
+
OrbitControls
```

를 사용한다.

카메라는 모델 전체를 쉽게 확인할 수 있는 위치에 둔다.

예:

```javascript
camera.position.set(4, 3, 5);
```

OrbitControls:

```javascript
controls.enableDamping = true;
```

사용을 권장한다.

---

# 22. Ground

산업 Prop 검증 Scene에는 가능한 한 Ground Plane을 둔다.

Ground 목적:

- Scale 확인
- Contact 위치 확인
- Shadow 확인
- 모델 Pivot 확인

모델이 Ground 아래로 내려가지 않도록 한다.

---

# 23. Shadows

필요한 경우:

```javascript
renderer.shadowMap.enabled = true;
```

Light:

```javascript
light.castShadow = true;
```

Mesh:

```javascript
mesh.castShadow = true;
mesh.receiveShadow = true;
```

단, 모든 작은 Mesh에 Shadow를 무조건 활성화하지 않는다.

---

# 24. Reusable Industrial Materials

가능하면 다음 Material Library를 만든다.

예:

```text
IndustrialMaterials
├── steelDark
├── steelLight
├── paintedSteelBlue
├── paintedSteelYellow
├── rubberBlack
├── plasticBlack
├── safetyRed
├── safetyYellow
└── glass
```

모델별로 Material을 중복 작성하지 않는다.

---

# 25. Safety Colors

산업 Asset에서 필요할 경우 다음과 같은 시각적 규칙을 사용할 수 있다.

```text
Yellow / Black
→ Hazard

Red
→ Emergency / Stop

Green
→ Normal / Running

Orange
→ Warning

Blue
→ Information
```

단, 특정 산업 규격을 구현하는 프로젝트에서는  
해당 규격을 먼저 확인한다.

---

# 26. UV and Texture

Primitive Material만으로 충분한 경우 Texture를 사용하지 않는다.

Texture가 필요한 경우:

```text
BaseColor
Normal
Roughness
Metalness
AO
```

방식을 우선한다.

Texture 경로 예:

```text
/public/textures/metal/
```

가능하면 1K 또는 2K Texture를 기본으로 사용한다.

불필요한 4K / 8K Texture 사용을 피한다.

---

# 27. glTF / GLB

외부 모델의 기본 교환 포맷은:

```text
GLB
```

를 권장한다.

FBX보다 Web 환경에서는 glTF / GLB를 우선한다.

외부 GLB 로딩은:

```javascript
GLTFLoader
```

를 사용한다.

---

# 28. Performance Guidelines

다음을 항상 고려한다.

- Draw Call
- Mesh Count
- Material Count
- Polygon Count
- Texture Size
- Shadow Cost
- Transparent Material
- Instancing

특히 반복되는 동일 Mesh는:

```javascript
THREE.InstancedMesh
```

사용을 적극 검토한다.

---

# 29. Modeling Workflow

새로운 산업 Prop 제작 요청을 받으면 다음 순서로 진행한다.

## Step 1

요구사항에서 실제 크기를 추출한다.

```text
Width
Height
Depth
```

## Step 2

Primary Shape를 만든다.

```text
Box
Cylinder
Plane
```

## Step 3

주요 구조물을 만든다.

```text
Frame
Door
Handle
Wheel
Valve
Pipe
```

## Step 4

Material을 적용한다.

## Step 5

Group으로 계층 구조를 구성한다.

## Step 6

Ground 기준 위치를 확인한다.

## Step 7

OrbitControls로 모든 방향에서 확인한다.

## Step 8

불필요한 Mesh와 Material을 줄인다.

## Step 9

필요하면 Detail을 추가한다.

---

# 30. Codex Working Rules

Codex는 작업 전에 기존 프로젝트 구조를 먼저 확인한다.

수정 전에:

```text
package.json
src/
public/
기존 Prop
Material
Utility
```

구조를 확인한다.

가능하면 기존 코드를 재사용한다.

새로운 Library를 추가하기 전에  
Three.js 기본 기능으로 해결 가능한지 먼저 판단한다.

---

# 31. Do Not Rewrite Unrelated Code

요청받지 않은 파일을 대규모로 수정하지 않는다.

예를 들어:

```text
"드럼통 Prop을 만들어줘"
```

라는 요청에서는:

```text
Renderer 구조 변경
Camera 시스템 변경
전체 프로젝트 리팩터링
```

등을 하지 않는다.

필요한 최소 범위에서 작업한다.

---

# 32. Verify After Editing

코드 수정 후 반드시 다음을 확인한다.

```bash
npm run dev
```

또는 프로젝트에서 정의된 개발 명령을 사용한다.

확인 사항:

```text
Build Error
JavaScript Error
Three.js Warning
Missing Asset
Invalid Path
NaN Transform
```

브라우저 Console Error가 없어야 한다.

---

# 33. Browser Validation

가능한 경우 실제 브라우저에서 확인한다.

검증 항목:

- Scene이 정상적으로 렌더링되는가
- Camera가 모델을 바라보는가
- 모델이 Ground 위에 있는가
- OrbitControls가 정상 동작하는가
- Material이 정상적으로 보이는가
- 모델 Scale이 현실적인가
- Console Error가 없는가

---

# 34. Visual Validation

산업 Prop 제작 후 다음 각도에서 확인한다.

```text
Front
Back
Left
Right
Top
Perspective
```

한 방향에서만 정상적으로 보이는 모델을 만들지 않는다.

---

# 35. Code Style

가능하면 간결한 ES Module 스타일을 사용한다.

예:

```javascript
import * as THREE from 'three';

export function createBarrel(options = {}) {
    // ...
}
```

함수는 하나의 책임을 갖도록 한다.

지나치게 긴 함수는 작은 함수로 분리한다.

---

# 36. Comments

주석은 코드의 동작을 그대로 설명하지 않는다.

피해야 할 예:

```javascript
// cube를 만든다
const cube = new THREE.Mesh(...);
```

좋은 예:

```javascript
// 산업용 캐비닛의 실제 판금 두께를 시각적으로 강조하기 위해
// 실제보다 약간 두껍게 표현한다.
```

"왜 이렇게 구현했는가"를 설명하는 주석을 우선한다.

---

# 37. AI Modeling Behavior

사용자가 자연어로 산업 Prop을 요청한 경우  
바로 Detail Mesh부터 제작하지 않는다.

먼저 다음을 추론한다.

```text
1. 전체 크기
2. 기본 형태
3. 주요 부품
4. 반복 부품
5. Material
6. Detail Level
```

정보가 없는 경우 합리적인 산업용 표준 형태를 사용하되  
과도하게 임의적인 Detail을 추가하지 않는다.

---

# 38. Preferred Modeling Strategy

산업 소품 제작 시 우선순위:

```text
Primitive Modeling
    ↓
Parameterized Modeling
    ↓
Reusable Components
    ↓
Instancing
    ↓
Texture Detail
    ↓
External GLB
```

처음부터 Blender 수준의 복잡한 Mesh를 코드로 재현하려 하지 않는다.

---

# 39. CSG

구멍, 절삭, 홈 등이 꼭 필요한 경우에만 CSG 사용을 검토한다.

예:

```text
Pipe Hole
Panel Opening
Window Opening
Mechanical Slot
```

단순한 시각적 표현이면  
별도 Mesh를 겹치는 방식을 우선한다.

CSG 사용으로 코드와 Geometry가 과도하게 복잡해지는 것을 피한다.

---

# 40. Component Library

반복적으로 사용할 수 있는 작은 부품은 Component로 분리한다.

예:

```text
components/
├── createBolt.js
├── createHandle.js
├── createCaster.js
├── createWarningLight.js
├── createPipe.js
├── createValve.js
└── createVent.js
```

Prop에서는 이를 조합한다.

예:

```text
ElectricalCabinet
=
CabinetBody
+
Handle
+
Vent
+
WarningLight
```

---

# 41. Model Metadata

필요하면 `userData`를 사용한다.

예:

```javascript
object.userData = {
    type: 'industrial-prop',
    category: 'electrical',
    assetName: 'control-cabinet'
};
```

Digital Twin 또는 Interaction 프로젝트 확장을 고려한다.

---

# 42. Asset Origin

가능하면 모델 Root Origin은:

```text
Bottom Center
```

를 사용한다.

회전 부품은 해당 부품의 회전축을 Pivot으로 사용한다.

예:

```text
Door → Hinge
Wheel → Center
Valve → Rotation Axis
Lever → Pivot
```

---

# 43. Animation Ready Structure

움직일 가능성이 있는 부품은 별도 Mesh / Group으로 유지한다.

예:

```text
Cabinet
├── Body
└── DoorPivot
    └── Door
```

이렇게 하면:

```javascript
doorPivot.rotation.y = ...
```

형태로 쉽게 애니메이션할 수 있다.

---

# 44. Interaction Ready Structure

Interaction 가능한 객체는 식별 가능한 Name을 갖게 한다.

예:

```javascript
door.name = 'CabinetDoor';
button.name = 'EmergencyStopButton';
valve.name = 'ValveHandle';
```

Raycaster로 선택할 수 있는 구조를 고려한다.

---

# 45. Final Checklist

새로운 산업 Prop을 완료하기 전에 확인한다.

- 실제 단위를 사용했는가
- Ground 위에 있는가
- Pivot이 적절한가
- Object 이름이 있는가
- Group 구조가 명확한가
- Material을 재사용했는가
- Magic Number가 과도하지 않은가
- Segment가 지나치게 높지 않은가
- 반복 Mesh에 Instancing 가능성이 있는가
- 모델을 모든 방향에서 확인했는가
- Console Error가 없는가
- 불필요한 외부 Library를 추가하지 않았는가
- 기존 프로젝트 구조를 불필요하게 변경하지 않았는가

---

# 46. Response Style for Codex

작업이 끝나면 다음 형식으로 간결하게 보고한다.

```text
구현 완료

생성:
- src/props/createIndustrialCabinet.js

수정:
- src/main.js

구현 내용:
- 캐비닛 본체
- 도어
- 손잡이
- 환기구
- 상태등 3개

주요 파라미터:
- Width: 1.2m
- Height: 2.0m
- Depth: 0.4m

검증:
- Vite 실행 정상
- 브라우저 렌더링 정상
- Console Error 없음
```

불필요하게 장황한 설명은 하지 않는다.

---

# 47. Guiding Principle

이 프로젝트에서 가장 중요한 원칙은 다음과 같다.

> Industrial 3D Asset을 하나의 완성된 고정 Mesh가 아니라  
> 코드로 수정할 수 있는 재사용 가능한 3D Component로 만든다.

따라서 가능하면 항상:

```text
Hard-coded Asset
```

보다

```text
Parameterized Asset Generator
```

방식을 우선한다.

 - 직접 Webbrowser를 띄워서 테스트하지는 말아줘. 내가 직접 테스트 할게.ㄴ