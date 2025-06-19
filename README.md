# 실시간 자세교정 웹 애플리케이션

웹캠을 활용한 실시간 자세 감지 및 교정 웹 애플리케이션입니다.

## 주요 기능

### 1. 실시간 자세 감지 및 교정

- 웹캠을 통한 실시간 자세 분석
- 자세 불량 시 알림 기능
- 자세 교정 가이드 제공

### 2. 사용자 관리

- 회원가입/로그인
- 개인정보 관리
- 자세 교정 기록 관리

### 3. 통계 및 리포트

- 일일/주간/월간 자세 교정 통계
- 자세 개선 추이 분석
- 맞춤형 리포트 제공

### 4. 커뮤니티 기능

- 자세 교정 팁 공유
- 사용자 간 소통
- 전문가 상담

## 기술 스택

### Frontend

- React
- Vite
- Styled-components
- Zustand (상태관리)
- MediaPipe Pose (자세 감지)

### Backend (예정)

- FastAPI
- MySQL

## 프로젝트 구조

```
src/
├── assets/          # 이미지, 폰트 등 정적 파일
├── components/      # 재사용 가능한 컴포넌트
│   ├── common/     # 공통 컴포넌트
│   └── layout/     # 레이아웃 관련 컴포넌트
├── hooks/          # 커스텀 훅
├── pages/          # 페이지 컴포넌트
├── store/          # Zustand 스토어
├── styles/         # 전역 스타일 및 테마
└── utils/          # 유틸리티 함수
```

## 시작하기

```bash
# 의존성 설치
yarn install

# 개발 서버 실행
yarn dev

# 빌드
yarn build
```

## 자세 감지 기능 구현 상세

### 구현된 기능

#### 1. **실시간 자세 분석**

- **MediaPipe Pose** 라이브러리를 활용한 실시간 인체 포즈 감지
- 웹캠을 통한 실시간 비디오 스트림 및 처리
- Canvas를 통한 포즈 랜드마크 시각화

#### 2. **자세 측정 지표**

- **목 각도**: 코(landmark[0])와 어깨 중점 사이의 각도 측정
- **어깨 기울기**: 좌우 어깨(landmark[11], landmark[12])의 기울기 측정

#### 3. **자세 상태 판단 알고리즘**

```javascript
// 목 각도 기준: 15도 이상 기울어지면 주의
if (Math.abs(neckAngle) > 15) {
  issues.push("목이 기울어져 있습니다");
  status = "주의";
}

// 어깨 기울기 기준: 10도 이상이면 주의
if (Math.abs(shoulderSlope) > 10) {
  issues.push("어깨가 기울어져 있습니다");
  status = "주의";
}
```

#### 4. **시각적 피드백**

- **포즈 랜드마크**: 빨간 점으로 신체 주요 부위 표시
- **뼈대 연결선**: 초록 선으로 신체 부위 간 연결 표시
- **상태별 색상**: 좋음(초록), 주의(빨강) 상태에 따른 색상 변경
- **실시간 분석 결과**: 목 각도, 어깨 기울기 수치 및 개선 사항 표시

#### 5. **상태 관리**

- **Zustand**를 통한 전역 자세 데이터 관리
- 실시간 자세 정보를 다른 컴포넌트와 공유
- 자세 히스토리 및 통계 데이터 저장 가능

### 사용된 라이브러리

```bash
npm install @mediapipe/pose @mediapipe/camera_utils @mediapipe/drawing_utils
```

- **@mediapipe/pose**: 실시간 인체 포즈 감지
- **@mediapipe/camera_utils**: 웹캠 스트림 관리
- **@mediapipe/drawing_utils**: 포즈 랜드마크 시각화

### 성능 최적화

- **모델 복잡도**: `modelComplexity: 1` (균형잡힌 성능과 정확도)
- **스무딩**: `smoothLandmarks: true` (부드러운 포즈 추적)
- **신뢰도 임계값**: `minDetectionConfidence: 0.5`, `minTrackingConfidence: 0.5`

### 브라우저 호환성

- HTTPS 환경에서만 웹캠 접근 가능
- 최신 브라우저 지원 (Chrome, Firefox, Safari, Edge)
- WebRTC API 지원 필요

## 라이선스

MIT
