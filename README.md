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

---

## 최근 개발 업데이트 (2024년)

### 🚀 MediaPipe 자세 감지 기능 대폭 개선

#### 1. **정교한 자세 분석 알고리즘 구현**

기존의 단순한 목/어깨 각도 측정에서 **6가지 종합 자세 지표**로 확장:

```javascript
// 새로운 자세 측정 지표들
1. 목 각도 (정상: -10° ~ 10°)
2. 어깨 기울기 (정상: -5° ~ 5°)
3. 등 각도 (정상: 85° ~ 95°)
4. 골반 기울기 (정상: -3° ~ 3°)
5. 머리 전방 돌출도 (정상: ≤ 10%)
6. 어깨 높이 차이 (정상: ≤ 5%)
```

#### 2. **자세 점수 시스템 도입**

- **100점 만점 기준** 종합 자세 평가
- 각 지표별 가중치 적용:
  - 등 각도: 25점 (가장 중요)
  - 목 각도: 20점
  - 머리 전방 돌출: 20점
  - 어깨 기울기: 15점
  - 골반 기울기: 15점
  - 어깨 높이 차이: 10점

#### 3. **실시간 알림 시스템**

```javascript
// 자세 점수 기반 알림
if (score < 60 && !notification) {
  setNotification({
    message: "자세가 좋지 않습니다! 자세를 교정해주세요.",
    type: "warning",
  });

  // 브라우저 알림 (사용자 허용 시)
  if (Notification.permission === "granted") {
    new Notification("자세 교정 알림", {
      body: "현재 자세가 좋지 않습니다. 자세를 교정해주세요.",
      icon: "/vite.svg",
    });
  }
}
```

#### 4. **향상된 UI/UX**

- **원형 점수 표시**: 색상 기반 직관적 점수 시각화
- **메트릭 카드**: 각 자세 지표별 상태 표시
- **실시간 알림 배너**: 우측 상단 슬라이드 인 애니메이션
- **반응형 그리드**: 다양한 화면 크기 지원

### 📊 자세 데이터 분석 페이지 신규 구현

#### 1. **독립적인 통계 페이지 분리**

- `src/pages/PostureData.jsx`: 전용 통계 페이지
- `src/styles/PostureData.styles.jsx`: 전용 스타일 관리

#### 2. **고급 통계 기능**

```javascript
// 통계 계산 로직
const calculateStats = (data) => {
  const avgScore =
    data.reduce((sum, record) => sum + record.score, 0) / data.length;
  const goodPostureCount = data.filter((record) => record.score >= 80).length;
  const poorPostureCount = data.filter((record) => record.score < 60).length;
  const excellentCount = data.filter((record) => record.score >= 90).length;

  // 개선도 계산 (최근 10개 vs 이전 10개)
  const recentScores = data.slice(-10).map((record) => record.score);
  const previousScores = data.slice(-20, -10).map((record) => record.score);

  return {
    avgScore: avgScore.toFixed(1),
    goodPostureCount,
    poorPostureCount,
    excellentCount,
    improvement: improvement.toFixed(1),
    consistency: ((goodPostureCount / data.length) * 100).toFixed(1),
  };
};
```

#### 3. **시간별 필터링 시스템**

- **전체**: 모든 기록
- **오늘**: 오늘 기록만
- **이번 주**: 최근 7일
- **이번 달**: 최근 30일

#### 4. **데이터 관리 기능**

- **JSON 내보내기**: 자세 데이터 백업
- **데이터 초기화**: 로컬 스토리지 클리어
- **히스토리 테이블**: 상세 기록 조회

#### 5. **8가지 핵심 통계 지표**

1. **평균 점수**: 전체 자세 점수 평균
2. **좋은 자세**: 80점 이상 기록 횟수
3. **나쁜 자세**: 60점 미만 기록 횟수
4. **개선도**: 최근 vs 이전 점수 비교
5. **일관성**: 좋은 자세 비율 (%)
6. **우수 자세**: 90점 이상 기록 횟수
7. **최고 점수**: 기록된 최고 점수
8. **최저 점수**: 기록된 최저 점수

### 🔄 자동 데이터 저장 시스템

```javascript
// 로컬 스토리지 자동 저장
const postureHistory = JSON.parse(
  localStorage.getItem("postureHistory") || "[]"
);
const newPostureRecord = {
  status,
  neckAngle,
  shoulderSlope,
  backAngle,
  hipSlope,
  headForward,
  shoulderHeightDiff,
  score,
  timestamp: Date.now(),
};

postureHistory.push(newPostureRecord);

// 최근 100개의 기록만 유지 (메모리 최적화)
if (postureHistory.length > 100) {
  postureHistory.splice(0, postureHistory.length - 100);
}

localStorage.setItem("postureHistory", JSON.stringify(postureHistory));
```

### 🎨 스타일 시스템 개선

#### 1. **모듈화된 스타일 관리**

- 각 페이지별 독립적인 스타일 파일
- 재사용 가능한 스타일 컴포넌트
- 테마 기반 일관된 디자인

#### 2. **새로운 스타일 컴포넌트**

```javascript
// 점수 표시용 원형 컴포넌트
export const ScoreCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ score }) => {
    if (score >= 80) return "linear-gradient(135deg, #4CAF50, #45a049)";
    if (score >= 60) return "linear-gradient(135deg, #FF9800, #F57C00)";
    return "linear-gradient(135deg, #F44336, #D32F2F)";
  }};
`;

// 알림 배너
export const NotificationBanner = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  animation: slideIn 0.3s ease-out;
`;
```

### 🚀 성능 최적화

#### 1. **코드 분리 및 최적화**

- 통계 기능을 별도 페이지로 분리
- 불필요한 리렌더링 방지
- 메모리 누수 방지를 위한 cleanup 함수

#### 2. **사용자 경험 개선**

- 실시간 피드백
- 직관적인 시각적 표현
- 반응형 디자인

### 📱 라우팅 시스템 확장

```javascript
// App.jsx 라우팅
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/detection" element={<PostureDetection />} />
  <Route path="/data" element={<PostureData />} />
</Routes>
```

### 🔧 기술적 개선사항

1. **MediaPipe 설정 최적화**

   - 더 정확한 랜드마크 감지
   - 부드러운 포즈 추적
   - 성능과 정확도의 균형

2. **상태 관리 개선**

   - Zustand를 활용한 효율적인 상태 관리
   - 자세 데이터의 실시간 동기화

3. **에러 처리 강화**
   - 웹캠 접근 오류 처리
   - MediaPipe 초기화 실패 대응
   - 사용자 친화적 오류 메시지

### 🎯 향후 개발 계획

1. **차트 및 그래프 추가**

   - 자세 점수 추이 그래프
   - 일별/주별/월별 통계 차트

2. **개인화 기능**

   - 사용자별 자세 교정 목표 설정
   - 맞춤형 알림 설정

3. **모바일 최적화**

   - 터치 인터페이스 개선
   - 모바일 웹캠 최적화

4. **AI 기반 자세 교정 가이드**
   - 개인별 자세 교정 운동 추천
   - 실시간 교정 가이드 제공
