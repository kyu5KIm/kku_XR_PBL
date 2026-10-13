공장 맵 - 36 x 24 m

원본: 저장소 루트의 docs/factory-layout-36x24.pdf (3 pages)
단위: Unity 1 unit = 1 m. 원점은 남서쪽 바닥 모서리.
X = 동쪽, Y = 높이, Z = 북쪽. 바닥 윗면 Y = 0.

열기
Project 창에서 Assets/FactoryMap/FactoryMap_36x24.unity를 더블 클릭합니다.
Tools > Factory Map > Open Factory Scene 메뉴로도 열 수 있습니다.
기존 씬과 프로젝트 설정은 변경하지 않았습니다.

편집
373개 구조 메시가 Unity ProBuilder 6.1.3의 ProBuilderMesh로 저장되었습니다.
프리팹 내부에서 편집하거나, 씬의 FactoryMap_36x24_PDF를 Unpack Prefab 후
ProBuilder의 면/에지/버텍스 모드를 사용합니다.
모든 Transform의 Scale은 (1,1,1)입니다.
구역 표시와 공정 화살표는 바닥 위 얇은 메시이며 충돌을 사용하지 않습니다.
바닥, 외벽, 설비에는 BoxCollider가 있습니다.

구성
36 x 24 m 바닥, 높이 4 m / 두께 0.2 m 외벽, 3개 출입구.
도면의 C01-C06 통로, Z01-Z08 구역, P01-P04 생산 공정.
24 m 직선 컨베이어, 조립 작업대 6개, 자동 시험 외함, 외관 검사대,
포장 작업대, 재작업 작업대/공구함, 부품 랙 2개, 팔레트 4개.
모든 주요 설비는 도면 3페이지의 위치와 크기를 바탕으로 모델링했습니다.
도면의 설비 외함 내부에는 작업대 다리, 선반, 컨베이어 프레임을 구성했고
상자/제품/공구함 손잡이/상태등은 식별을 위한 추가 소품입니다.
구역은 벽으로 구획하지 않고 도면과 같이 바닥 색과 경계선으로 표시했습니다.
벽은 사용 가능한 바닥 치수를 유지하도록 외곽에 배치했습니다.
천장은 편집과 평면 확인을 위해 생략했습니다.
PlayerSpawn = (18,0,2). 카메라와 조명을 포함했습니다.
Plan Camera (disabled)는 평면 확인용 비활성 카메라입니다.

범위
편집 가능한 정적 공장 블록아웃과 데스크톱 1인칭 플레이어입니다.
컨베이어 동작, 제품 이동, 검사 판정, XR 플레이어는 포함하지 않습니다.

1인칭 이동
FactoryMap_36x24 씬에서 Play를 누르고 Game 화면을 클릭합니다.
WASD = 이동, Mouse = 시야 회전, Esc = 마우스 잠금 해제.
잠금 해제 후 Game 화면을 클릭하면 다시 조작됩니다.
플레이어 시작점 (18,0,2), 이동 속도 4 m/s, 눈높이 1.65 m.
CharacterController 높이 1.8 m / 반지름 0.3 m.
대각선 이동은 동일 속도로 정규화되며 위아래 시야는 85도로 제한됩니다.
FactoryFirstPersonPlayer.prefab과 Scripts/FactoryFirstPersonController.cs에서 조정 가능합니다.
기존 전체 보기 카메라는 씬에 보관하고 비활성화했습니다.

검증
Unity 6000.6.4f1에서 씬/프리팹을 생성하고 저장 후 다시 열어 검증했습니다.
ProBuilder 메시 373개, 누락된 메시 없음, Scale (1,1,1), 조립 작업대 6개.
FactoryPerspective.png 및 FactoryTopDown.png는 해당 Unity 씬의 실제 렌더입니다.

재생성
Editor/FactoryMapBuilder.cs에 생성 코드를 보관했습니다.
Create 36x24 Factory 메뉴는 기존 FactoryMap.prefab이 존재하면 중단합니다.
기존 결과를 보존한 상태에서 생성 경로를 변경해 새 버전을 만드세요.
