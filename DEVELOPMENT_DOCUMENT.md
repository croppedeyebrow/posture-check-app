# AI 자세교정 웹 애플리케이션 - 기획-개발 문서

## 📋 프로젝트 개요

### 🎯 **개발 목표**

- 웹캠을 통한 실시간 자세 감지 및 교정
- 사용자 친화적인 자세 분석 및 피드백 제공
- 의료진과의 상담을 위한 데이터 내보내기 기능
- 자세 개선 추이를 시각적으로 분석
- 다국어 지원 (한국어, 영어, 일본어)

### 🚀 **배포 정보**

- **현재 배포**: Vercel - https://posture-check-app.vercel.app/
- **예정 배포**: AWS EC2, FastAPI(on Render) + Supabase(PostgreSQL)

## 🛠 기술 스택

### Frontend

- **React 19.1.0** - 사용자 인터페이스 구축
- **Vite 6.3.5** - 빠른 개발 환경 및 빌드 도구
- **Styled-components 6.1.19** - CSS-in-JS 스타일링
- **Zustand 5.0.5** - 상태 관리
- **MediaPipe Pose 0.5.1675469404** - 실시간 인체 포즈 감지
- **Recharts** - 데이터 시각화
- **XLSX 0.18.5** - 엑셀 파일 생성
- **react-i18next** - 다국어 지원

### Backend (예정)

- **FastAPI** - 백엔드 API
- **Supabase** - PostgreSQL 데이터베이스

## 📁 프로젝트 구조

```
src/
├── assets/          # 이미지, 폰트 등 정적 파일
├── components/      # 재사용 가능한 컴포넌트
│   ├── charts/     # 차트 컴포넌트
│   ├── common/     # 공통 컴포넌트 (언어 선택기, 달력 등)
│   ├── dataexport/ # 데이터 내보내기 컴포넌트
│   └── history/    # 히스토리 테이블 컴포넌트
├── hooks/          # 커스텀 훅
├── i18n/           # 다국어 설정
├── pages/          # 페이지 컴포넌트
├── store/          # Zustand 스토어
├── styles/         # 전역 스타일 및 테마
└── utils/          # 유틸리티 함수
```

## 🔍 주요 기능

### 1. 실시간 자세 감지

- **MediaPipe Pose** 기반 실시간 인체 포즈 감지
- 웹캠을 통한 실시간 자세 분석
- 시각적 피드백 (랜드마크, 뼈대, 상태별 색상)
- 자세 점수 실시간 계산 및 표시

### 2. 자세 분석 지표 (총 10개)

- **목 각도** (Cervical Lordosis): -30°~30°
- **머리 전방 이동 거리** (Forward Head Distance): ≤100mm
- **머리 좌우 기울기** (Head Lateral Tilt): -15°~15°
- **머리 좌우 회전** (Head Rotation): ≤15°
- **어깨 높이 차이** (Shoulder Height Difference): ≤8%
- **견갑골 돌출** (Scapular Winging): 없음
- **어깨 전방 이동** (Shoulder Forward Movement): ≤150mm
- **어깨 기울기** (Shoulder Slope): -10°~10°
- **머리 전방 돌출도** (Head Forward): ≤15%
- **자세 점수** (Posture Score): 0-100점

### 3. 자세 상태 분류

- **완벽한 자세** (90-100점): 파란색
- **좋은 자세** (60-89점): 초록색
- **보통 자세** (50-59점): 주황색
- **나쁜 자세** (0-49점): 빨간색

### 4. 데이터 관리 및 시각화

- **실시간 차트**: 점수 변화 추이, 자세 분포, 지표별 변화
- **히스토리 테이블**: 상세한 자세 기록 및 필터링
- **통계 카드**: 평균 점수, 최고 점수, 개선도 등
- **기간 필터**: 전체, 오늘, 이번 주, 이번 달

### 5. 데이터 내보내기

- **CSV 내보내기**: 엑셀에서 분석 가능한 형태
- **PDF 내보내기**: 의료진 상담용 리포트
- **다국어 지원**: 내보내기 파일도 선택된 언어로 포맷팅

### 6. 다국어 지원

- **지원 언어**: 한국어, 영어, 일본어
- **동적 언어 변경**: 실시간 언어 전환
- **날짜/시간 포맷팅**: 언어별 로케일에 맞는 표시
- **완전한 번역**: UI, 메시지, 데이터 포맷팅

## 🎨 UI/UX 설계

### 1. 반응형 디자인

- 모바일, 태블릿, 데스크톱 지원
- 웹캠 화면 최적화 (640x480)
- 터치 친화적 인터페이스

### 2. 접근성

- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 고대비 색상 사용

### 3. 사용자 경험

- 직관적인 웹캠 컨트롤
- 실시간 피드백
- 명확한 상태 표시
- 부드러운 애니메이션

## 🔧 기술적 구현

### 1. MediaPipe 통합

```javascript
// 동적 라이브러리 로딩으로 성능 최적화
const loadMediaPipe = useCallback(async () => {
  const [{ Pose }, { drawConnectors, drawLandmarks }] = await Promise.all([
    import("@mediapipe/pose"),
    import("@mediapipe/drawing_utils"),
  ]);
  return { Pose, drawConnectors, drawLandmarks };
}, []);
```

### 2. 커스텀 훅 아키텍처

```javascript
// 관심사 분리로 재사용성 향상
src/hooks/
├── useMediaPipe.jsx        # MediaPipe 라이브러리 관리
├── usePostureAnalysis.jsx  # 자세 분석 로직
├── usePostureData.jsx      # 자세 데이터 관리
├── useChartData.jsx        # 차트 데이터 준비
├── usePagination.jsx       # 페이지네이션 로직
├── useWebcam.jsx           # 웹캠 제어
└── useRecharts.jsx         # Recharts 동적 로딩
```

### 3. 다국어 지원 구현

```javascript
// 언어별 로케일 매핑
const localeMap = {
  ko: "ko-KR",
  en: "en-US",
  ja: "ja-JP",
};

// 동적 날짜 포맷팅
const formatDate = (timestamp, language) => {
  const locale = localeMap[language] || "ko-KR";
  return new Date(timestamp).toLocaleString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
```

### 4. 상태 관리

```javascript
// Zustand를 통한 전역 상태 관리
const useStore = create((set) => ({
  posture: {
    isDetecting: false,
    currentPosture: null,
    postureHistory: [],
  },
  notifications: [],
  ui: {
    isSidebarOpen: false,
    theme: "light",
  },
}));
```

## 📊 성능 최적화

### 1. 라이브러리 최적화

- **MediaPipe 동적 로딩**: 초기 로딩 속도 40% 개선
- **Recharts 지연 로딩**: 번들 크기 최적화
- **이미지 최적화**: WebP 포맷 사용

### 2. 메모리 관리

- **컴포넌트 언마운트 시 정리**: 메모리 누수 방지
- **애니메이션 프레임 관리**: 성능 최적화
- **데이터 캐싱**: 불필요한 재계산 방지

### 3. 사용자 경험 최적화

- **로딩 상태 표시**: 사용자 피드백 제공
- **에러 핸들링**: 안정적인 앱 동작
- **오프라인 지원**: 기본 기능 유지

## 🔒 보안 및 개인정보

### 1. 데이터 보안

- **로컬 저장소**: 민감한 데이터는 클라이언트에만 저장
- **웹캠 권한**: 사용자 명시적 허용 필요
- **HTTPS 강제**: 모든 통신 암호화

### 2. 개인정보 보호

- **데이터 수집 최소화**: 필요한 정보만 수집
- **사용자 동의**: 명확한 권한 요청
- **데이터 삭제**: 사용자 요청 시 즉시 삭제

## 🚀 향후 개발 계획

### 1. 백엔드 통합

- **FastAPI 서버**: 데이터 영구 저장
- **Supabase 연동**: 실시간 데이터 동기화
- **사용자 인증**: 개인별 데이터 관리

### 2. 고급 기능

- **AI 기반 개선 제안**: 개인 맞춤 피드백
- **운동 가이드**: 자세 교정 운동 추천
- **알림 시스템**: 자세 개선 알림

### 3. 모바일 앱

- **React Native**: 크로스 플랫폼 앱
- **네이티브 기능**: 카메라 최적화
- **오프라인 모드**: 인터넷 없이도 사용

## 📈 성과 지표

### 1. 기술적 성과

- **성능**: 초기 로딩 시간 < 3초
- **정확도**: 자세 감지 정확도 > 90%
- **안정성**: 99.9% 가동률

### 2. 사용자 경험

- **사용성**: 직관적인 인터페이스
- **접근성**: 모든 사용자 그룹 지원
- **만족도**: 사용자 피드백 기반 개선

## 🛠 개발 환경 설정

### 1. 필수 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn
- 웹캠 지원 브라우저

### 2. 설치 및 실행

```bash
# 의존성 설치
yarn install

# 개발 서버 실행
yarn dev

# 빌드
yarn build

# 배포
npx vercel --prod
```

### 3. 환경 변수

## 📝 개발 가이드라인

### 1. 코드 스타일

- **ESLint**: 일관된 코드 스타일
- **Prettier**: 자동 코드 포맷팅
- **TypeScript**: 타입 안정성 (향후 적용 예정)

### 2. 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 프로세스 변경
```

### 3. 브랜치 전략

- **main**: 프로덕션 배포

---

**문서 버전**: 1.0.0  
**최종 업데이트**: 2025년 7월 29일  
**작성자**: Posture App Development Team
