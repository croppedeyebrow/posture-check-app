# 🧍‍♂️ Posture Check App Frontend (React)
> **실시간 자세 분석 결과를 사용자에게 직관적으로 제공하는 웹 인터페이스**

[🔗 Backend Repository](https://github.com/croppedeyebrow/posture-check-app-back)

---

## 🩺 프로젝트 개요

> 백엔드 서버에서 처리된 **의학적 자세 분석 데이터**를 수신하여 웹캠을 통한 **실시간 시각화 피드백**과 **개선 추이 통계**를 제공하는 사용자 중심의 웹 애플리케이션입니다.

### 핵심 특징
* **실시간 자세 감지/표시:** $\text{MediaPipe Pose}$를 활용하여 $\text{13}$개 지표의 $\text{Raw Data}$를 실시간으로 추출.
* **백엔드 API 연동:** 추출된 $\text{Raw Data}$를 $\text{FastAPI}$ 서버로 전송하고 분석 결과를 수신하여 $\text{UI}$에 즉시 반영.
* **데이터 시각화:** $\text{Recharts}$를 사용하여 백엔드에서 조회한 통계 데이터 ($\text{개선률, 트렌드}$)를 직관적인 차트로 표현.
* **사용자 분석:** $\text{Google Analytics 4}$ ($\text{GA4}$)를 통합하여 사용자 행동 분석 환경 구축.

| 항목 | 내용 |
| :--- | :--- |
| 🧠 목적 | 백엔드 분석 데이터를 직관적인 $\text{UX}$로 제공하여 사용자 경험 극대화 |
| ⚙️ 기술 스택 | **React 19.1.0**, **Vite**, **Styled-components**, **Zustand** |
| 📊 핵심 라이브러리 | **MediaPipe Pose**, **Recharts**, **XLSX** |
| 🔗 연동 | $\text{FastAPI}$ 기반 백엔드 서버와 $\text{RESTful API}$ 통신 |

---

## 🛠 기술 스택

| 구분 | 기술 | 사용 이유 |
| :--- | :--- | :--- |
| **Framework** | **React 19.1.0** ($\text{Vite}$ 빌드) | 컴포넌트 기반 $\text{SPA}$ 개발 및 빠른 개발 환경 구축 |
| **상태 관리** | **Zustand 5.0.5** | 간결하고 직관적인 전역 상태 관리 및 백엔드 데이터 캐싱 |
| **스타일링** | **Styled-components** | 컴포넌트 단위 스타일링을 통한 $\text{CSS}$ 충돌 방지 |
| **시각화/인식** | **MediaPipe Pose** | **고성능 실시간 $\text{AI}$ 자세 인식** 및 $\text{13}$개 지표 $\text{Raw Data}$ 추출 |
| **차트** | **Recharts** | 백엔드 통계 데이터 ($\text{시계열, 비율}$)를 직관적으로 표현 |
| **데이터 처리** | **XLSX** | 사용자 기록 데이터의 $\text{Excel}$ 내보내기 기능 구현 |

### 💡 주요 라이브러리 상세 설명: MediaPipe Pose

**MediaPipe Pose**는 **Google**에서 개발한 머신러닝 솔루션입니다. 웹캠 영상 스트림에서 사용자의 **총 33개의 3차원 관절 위치($\text{Keypoint}$)를 실시간으로 정확하게 감지**하고, 이 데이터를 백엔드로 전송하여 **13개 자세 지표 분석의 $\text{Raw Data}$**를 제공하는 핵심 엔진 역할을 합니다.

---

## 🧠 설계 포인트 (백엔드 연동 및 데이터 관리)

| 핵심 영역 | 설명 | 백엔드 개발자로서의 기여 강조 |
| :--- | :--- | :--- |
| **자세 인식 파이프라인** | $\text{MediaPipe}$ $\to$ 지표 가공 $\to$ $\text{POST}$ $\text{API}$ $\to$ $\text{UI}$ 피드백의 실시간 파이프라인 구축. | $\text{Raw Data}$ 생성의 기술적 기반을 마련하고, $\text{Client/Server}$ 간 **데이터 품질 및 전송 규약**을 설계. |
| **API 통신 모듈화** | $\text{apiClient}$ 유틸리티를 별도 구현하여 $\text{Header}$ 설정, 에러 처리, $\text{URL}$ 관리를 일원화. | 백엔드 $\text{API}$ 변화에 유연하게 대응하고, $\text{CORS}$ 및 인증 $(\text{JWT})$ 연동 준비. |
| **상태 관리 (Zustand)** | 백엔드 데이터, 세션 상태, $\text{Loading}$ 상태 등을 중앙 집중화하여 $\text{Client}$와 $\text{Server}$ 상태를 효율적으로 분리/동기화 관리. | **시스템 통합 관점**에서 $\text{Client}$와 $\text{Server}$ 상태를 효율적으로 분리/동기화 관리. |
| **환경 변수 관리** | `VITE_BACKEND_TYPE` 및 `VITE_PRODUCTION_API_URL` 등을 사용하여 **개발/배포 환경별 $\text{API}$ 엔드포인트를 분리**하여 안정적인 배포 환경 구축. | **풀스택 관점**에서 배포 파이프라인의 견고성 확보. |

---

## 🔄 백엔드 연동 워크플로우

### 1. POST 요청 흐름 (자세 데이터 전송 및 분석 결과 수신)
| 단계 | 설명 | 역할 |
| :--- | :--- | :--- |
| **① 데이터 추출** | $\text{MediaPipe}$ $\to$ $\text{13}$개 지표 $\text{Raw Data}$ 추출 | $\text{Frontend}$ |
| **② $\text{POST}$ 요청** | $\text{apiClient}$를 통해 백엔드 `/record` $\text{API}$ 호출 | $\text{Frontend}$ |
| **③ 분석 및 저장** | 백엔드 $\to$ 데이터 검증, 분석 로직 실행, $\text{MySQL}$ 저장 | $\text{Backend}$ |
| **④ 결과 수신** | 백엔드 분석 결과 ($\text{score}$, $\text{정상/비정상}$ 등) $\text{JSON}$ 수신 | $\text{Frontend}$ |
| **⑤ $\text{UI}$ 반영** | 수신된 분석 결과에 따라 $\text{UI}$ (색상, 텍스트) 실시간 업데이트 | $\text{Frontend}$ |

---
