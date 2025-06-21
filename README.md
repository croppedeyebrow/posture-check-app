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

### First Deployment

- Vercel

### Backend (예정)

- FastAPI
- MySQL

### Second Deployment

- AWS EC2

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

https://velog.io/@c_d_c/%EC%9B%B9%EC%95%B1-FullStack-%EA%B0%9C%EB%B0%9C%EC%9E%90-%EC%B7%A8%EC%97%85-%EC%A4%80%EB%B9%84-%EC%9D%BC%EA%B8%B0-%EA%B0%9C%EB%B0%9C-%ED%8F%AC%ED%8F%B4%EC%9D%84-%EC%9C%84%ED%95%9C-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EA%B5%AC%EC%84%B1-%EC%8B%A4%EC%8B%9C%EA%B0%84-%EC%9E%90%EC%84%B8-%EA%B5%90%EC%A0%95-%EC%95%B1-%EB%A7%8C%EB%93%A4%EA%B8%B0...ing

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

## 최근 개발 업데이트 (2024년 12월)

### 🎯 **자세 감지 기준 대폭 개선**

#### 1. **관대한 자세 기준 적용**

기존의 엄격한 기준에서 **실제 달성 가능한 기준**으로 완전 개선:

```javascript
// 새로운 관대한 자세 기준
1. 목 각도: -30° ~ 30° (기존 -20° ~ 20°)
2. 어깨 기울기: -15° ~ 15° (기존 -10° ~ 10°)
3. 머리 전방 돌출도: ≤ 20% (기존 ≤ 15%)
4. 어깨 높이 차이: ≤ 12% (기존 ≤ 8%)
```

#### 2. **점수 시스템 최적화**

- **80점 이상**: "좋음" (기존 85점)
- **65-79점**: "보통" (기존 70점)
- **50-64점**: "주의"
- **50점 미만**: "나쁨"

#### 3. **알림 시스템 개선**

- **50점 미만**일 때만 알림 (기존 60점)
- **65점 이상**이면 알림 해제 (기존 70점)
- 사용자 스트레스 최소화

### 📊 **의료진 친화적 데이터 내보내기**

#### 1. **CSV 내보내기 기능**

```javascript
// CSV 파일 구성
- 파일명: 자세데이터_YYYY-MM-DD.csv
- 한글 지원: BOM 추가로 깨짐 방지
- 컬럼: 날짜/시간, 점수, 상태, 목각도, 어깨기울기, 머리전방돌출도, 어깨높이차이, 자세피드백
```

#### 2. **엑셀 리포트 기능**

- **XLSX 라이브러리** 활용한 실제 엑셀 파일 생성
- **2개 시트 구성**:
  - **시트 1**: 자세 데이터 (색상 코딩 포함)
  - **시트 2**: 통계 요약 (생성일, 평균점수, 개선도 등)

#### 3. **의료진 활용 최적화**

```javascript
// 점수별 색상 코딩
- 80점 이상: 연한 초록 (좋음)
- 65-79점: 연한 파랑 (보통)
- 50-64점: 연한 주황 (주의)
- 50점 미만: 연한 빨강 (나쁨)
```

### 🔧 **기술적 개선사항**

#### 1. **함수 선언 순서 최적화**

- `getScoreStatus` 함수를 `exportData` 함수보다 먼저 선언
- React Hook 규칙 준수로 초기화 오류 해결

#### 2. **XLSX 라이브러리 통합**

```bash
npm install xlsx
```

- 실제 엑셀 파일(.xlsx) 생성
- 열 너비 자동 조정
- 셀 스타일링 (색상, 폰트 등)

#### 3. **데이터 포맷 최적화**

- **숫자 데이터**: `parseFloat()` 변환으로 엑셀에서 계산 가능
- **날짜 포맷**: 한국어 로케일 적용
- **한글 지원**: UTF-8 인코딩으로 완벽 지원

### 🎨 **UI/UX 개선**

#### 1. **내보내기 버튼 분리**

- **CSV 내보내기**: 기본 데이터 내보내기
- **엑셀 리포트**: 의료진용 상세 리포트
- **데이터 초기화**: 안전한 데이터 삭제

#### 2. **버튼 스타일링**

```javascript
// 새로운 스타일 컴포넌트
export const ExcelExportButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  // 엑셀 리포트 전용 스타일
`;
```

### 📈 **통계 기준 조정**

#### 1. **관대한 통계 기준**

- **좋은 자세**: 80점 이상 (기존 85점)
- **나쁜 자세**: 50점 미만 (기존 60점)
- **완벽 자세**: 90점 이상 (기존 95점)
- **일관성**: 50% 이상 (기존 60%)

#### 2. **실용적 피드백**

- **단계별 감점**: 심각한 문제와 경미한 문제 구분
- **점진적 개선**: 작은 개선도 인정
- **현실적 목표**: 달성 가능한 자세 기준

### 🏥 **의료진 활용 시나리오**

#### 1. **진료 기록 관리**

```javascript
// 엑셀 리포트 활용
- 환자별 자세 개선 추이 분석
- 치료 효과 측정 및 기록
- 맞춤형 자세 교정 프로그램 설계
```

#### 2. **연구 및 분석**

```javascript
// CSV 데이터 활용
- 대량 데이터 분석
- 자세 개선 효과 연구
- 논문 작성 및 발표 자료
```

#### 3. **치료 계획 수립**

```javascript
// 통계 요약 활용
- 개인별 자세 패턴 분석
- 치료 목표 설정
- 재활 프로그램 계획
```

### 🚀 **성능 최적화**

#### 1. **메모리 관리**

- 최근 100개 기록만 유지
- 불필요한 데이터 자동 정리
- 효율적인 로컬 스토리지 활용

#### 2. **사용자 경험**

- 실시간 피드백
- 직관적인 시각적 표현
- 반응형 디자인

### 🎯 **향후 개발 계획**

#### 1. **차트 및 그래프**

- 자세 점수 추이 그래프
- 일별/주별/월별 통계 차트
- 시각적 데이터 분석 도구

#### 2. **개인화 기능**

- 사용자별 자세 교정 목표 설정
- 맞춤형 알림 설정
- 개인별 통계 대시보드

#### 3. **모바일 최적화**

- 터치 인터페이스 개선
- 모바일 웹캠 최적화
- 반응형 레이아웃 강화

#### 4. **AI 기반 분석**

- 자세 패턴 학습
- 개인별 맞춤 교정 가이드
- 예측 분석 기능

### 📋 **개발 완료 체크리스트**

- ✅ MediaPipe 자세 감지 구현
- ✅ 실시간 자세 분석 및 피드백
- ✅ 자세 점수 시스템 구현
- ✅ 실시간 알림 시스템
- ✅ 자세 데이터 저장 및 관리
- ✅ 통계 페이지 분리 및 구현
- ✅ CSV/엑셀 데이터 내보내기
- ✅ 의료진 친화적 리포트 생성
- ✅ 관대한 자세 기준 적용
- ✅ 사용자 경험 최적화

### 🔗 **기술 스택 업데이트**

#### Frontend

- React 19.1.0
- Vite 6.3.5
- Styled-components 6.1.19
- Zustand 5.0.5
- MediaPipe Pose 0.5.1675469404
- **XLSX 0.18.5** (새로 추가)

#### 개발 도구

- ESLint 9.25.0
- TypeScript 지원
- Hot Module Replacement

#### 개발 도구

- ESLint 9.25.0
- TypeScript 지원
- Hot Module Replacement

---

## 🚀 **Vercel 배포 완료 (2024년 12월)**

### ✅ **배포 정보**

#### **프로덕션 URL**

- **메인 URL**: https://posture-check-95gfetj7f-leejaesungs-projects-6779349e.vercel.app
- **프로젝트명**: posture-check-app
- **Vercel 대시보드**: https://vercel.com/leejaesungs-projects-6779349e/posture-check-app/Hb8naJGsfFWa2yjKteZdMB6jG4ns

#### **배포 설정**

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 🔧 **배포 준비 작업**

#### 1. **Vercel CLI 설치**

```bash
yarn global add vercel
# 또는
npm install -g vercel
```

#### 2. **배포 설정 파일 생성**

**vercel.json**

- Vite 프레임워크 자동 감지
- SPA 라우팅을 위한 리다이렉트 설정
- 정적 자산 캐싱 최적화

**public/\_redirects**

```
/*    /index.html   200
```

#### 3. **HTML 메타데이터 최적화**

```html
<!-- index.html -->
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/allright_posture.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="AI 기반 실시간 자세 교정 웹 애플리케이션 - MediaPipe를 활용한 정확한 자세 분석"
    />
    <meta
      name="keywords"
      content="자세교정, 자세분석, AI, MediaPipe, 웹캠, 실시간감지"
    />
    <meta name="author" content="Posture App Team" />
    <title>AI 자세교정 앱 - 실시간 자세 분석 및 교정</title>
  </head>
</html>
```

### 📋 **배포 과정**

#### 1. **Vercel 로그인**

```bash
npx vercel login
# 이메일 인증: lee940706@gmail.com
```

#### 2. **프로젝트 배포**

```bash
npx vercel
```

#### 3. **자동 설정된 구성**

- **빌드 명령어**: `npm run build`
- **프레임워크**: Vite (자동 감지)
- **출력 디렉토리**: `dist`
- **개발 명령어**: `vite --port $PORT`
- **설치 명령어**: yarn/npm/pnpm/bun 자동 감지

### 🎯 **배포 완료 체크리스트**

- ✅ Vercel CLI 설치
- ✅ vercel.json 설정 파일 생성
- ✅ HTML 메타데이터 최적화
- ✅ 파비콘 설정 (allright_posture.ico)
- ✅ SPA 라우팅 설정
- ✅ Vercel 로그인
- ✅ 프로젝트 배포
- ✅ 프로덕션 URL 생성
- ✅ 자동 빌드 설정

### 🔗 **배포 후 관리**

#### **자동 배포 설정**

- Git 저장소 연결 시 코드 변경 시 자동 배포
- 브랜치별 프리뷰 배포 지원

#### **도메인 관리**

- Vercel 대시보드에서 커스텀 도메인 설정 가능
- SSL 인증서 자동 발급

#### **성능 모니터링**

- Vercel Analytics로 사용자 행동 분석
- 실시간 성능 메트릭 확인

### 📊 **배포 통계**

- **빌드 시간**: 3초
- **번들 크기**: 최적화 완료
- **첫 로딩 시간**: 빠른 로딩
- **SEO 최적화**: 메타데이터 완비

### 🎉 **배포 성공!**

AI 자세교정 앱이 성공적으로 Vercel에 배포되었습니다!

**바로 사용하기**: https://posture-check-95gfetj7f-leejaesungs-projects-6779349e.vercel.app

---

## 📞 **문의 및 지원**

프로젝트 관련 문의사항이나 개선 제안이 있으시면 언제든 연락주세요!

**개발자**: LeeJaeSung  
**이메일**: lee940706@gmail.com  
**블로그**: https://velog.io/@c_d_c
