# API 클라이언트 사용 가이드

## 📁 API 구조

```
src/api/
├── index.js              # 기본 API 설정 및 공통 함수
├── authApi.js            # 인증 관련 API
├── postureApi.js         # 자세 데이터 관련 API
├── userApi.js            # 사용자 설정 관련 API
├── notificationApi.js    # 알림 및 시스템 관련 API
├── apiClient.js          # 통합 API 클라이언트
└── README.md             # 이 문서
```

## 🚀 기본 사용법

### 1. API 클라이언트 import

```javascript
import { apiClient, apiHelpers, apiStatus } from "../api/apiClient.js";
```

### 2. 환경 변수 설정

`.env` 파일에 백엔드 API URL 설정:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🔐 인증 관련 API

### 로그인

```javascript
try {
  const response = await apiClient.auth.login({
    email: "user@example.com",
    password: "password123",
  });
  console.log("로그인 성공:", response.user);
} catch (error) {
  console.error("로그인 실패:", error.message);
}
```

### 로그아웃

```javascript
await apiClient.auth.logout();
```

### 인증 상태 확인

```javascript
const authStatus = apiClient.auth.checkAuthStatus();
if (authStatus.isAuthenticated) {
  console.log("로그인된 사용자:", authStatus.user);
}
```

## 📊 자세 데이터 관련 API

### 자세 데이터 저장

```javascript
const postureData = {
  score: 85,
  neckAngle: 15,
  shoulderSlope: 5,
  headForward: 10,
  // ... 기타 자세 지표
};

// 로컬 + 서버 동기화 저장
const savedData = await apiHelpers.saveAndSyncPostureData(postureData);
```

### 자세 데이터 조회

```javascript
// 로컬 + 서버 데이터 로드
const history = await apiHelpers.loadPostureData({
  start_date: "2024-01-01",
  end_date: "2024-12-31",
});

// 서버에서만 조회
const serverHistory = await apiClient.posture.getPostureHistory({
  limit: 50,
  offset: 0,
});
```

### 자세 통계 조회

```javascript
const stats = await apiClient.posture.getPostureStats({
  period: "month", // day, week, month, year
});
```

## 👤 사용자 관련 API

### 프로필 조회

```javascript
const profile = await apiClient.user.getUserProfile();
```

### 설정 조회

```javascript
const settings = await apiClient.user.getUserSettings();
```

### 언어 설정 변경

```javascript
await apiClient.user.updateLanguage("en");
```

### 프로필 이미지 업로드

```javascript
const fileInput = document.getElementById("profile-image");
const file = fileInput.files[0];

if (file) {
  const result = await apiClient.user.uploadProfileImage(file);
  console.log("업로드 성공:", result.image_url);
}
```

## 🔔 알림 관련 API

### 알림 목록 조회

```javascript
const notifications = await apiClient.notification.getNotifications({
  unread: true,
  limit: 10,
});
```

### 알림 읽음 처리

```javascript
await apiClient.notification.markNotificationAsRead(notificationId);
```

### 알림 설정 조회

```javascript
const settings = await apiClient.notification.getNotificationSettings();
```

## 🛠 시스템 관련 API

### 시스템 상태 확인

```javascript
const status = await apiClient.system.getSystemStatus();
```

### 파일 업로드

```javascript
const file = document.getElementById("file-input").files[0];
const result = await apiClient.system.uploadFile(file, "posture-image");
```

### 에러 리포트 전송

```javascript
try {
  // 어떤 작업
} catch (error) {
  await apiHelpers.handleError(error, { context: "posture-analysis" });
}
```

## 🔄 데이터 동기화

### 사용자 설정 동기화

```javascript
const settings = await apiHelpers.syncUserSettings();
```

### 알림 처리

```javascript
const notifications = await apiHelpers.handleNotifications();
```

## 📱 API 상태 관리

### 온라인 상태 확인

```javascript
if (apiStatus.isOnline) {
  console.log("온라인 상태");
} else {
  console.log("오프라인 상태");
}
```

### 인증 상태 확인

```javascript
if (apiStatus.isAuthenticated) {
  console.log("인증됨");
} else {
  console.log("인증되지 않음");
}
```

### 로딩 상태 관리

```javascript
apiStatus.setLoading(true);
try {
  await someApiCall();
} finally {
  apiStatus.setLoading(false);
}
```

## 🎯 실제 사용 예시

### PostureDetection 컴포넌트에서 사용

```javascript
import { apiHelpers } from "../api/apiClient.js";

const PostureDetection = () => {
  const handlePostureAnalysis = async (postureData) => {
    try {
      // 자세 데이터 저장 및 동기화
      const savedData = await apiHelpers.saveAndSyncPostureData(postureData);

      // 성공 알림
      console.log("자세 데이터 저장 완료:", savedData);
    } catch (error) {
      // 에러 처리
      await apiHelpers.handleError(error, {
        context: "posture-detection",
        postureData,
      });
    }
  };

  // ... 나머지 컴포넌트 로직
};
```

### PostureData 컴포넌트에서 사용

```javascript
import { apiHelpers } from "../api/apiClient.js";

const PostureData = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await apiHelpers.loadPostureData({
        start_date: startDate,
        end_date: endDate,
      });
      setHistory(data);
    } catch (error) {
      await apiHelpers.handleError(error, { context: "data-loading" });
    } finally {
      setLoading(false);
    }
  };

  // ... 나머지 컴포넌트 로직
};
```

## 🔧 에러 처리

### 공통 에러 처리

API 클라이언트는 자동으로 다음 에러들을 처리합니다:

- **401 Unauthorized**: 자동 로그아웃 및 로그인 페이지 리다이렉트
- **403 Forbidden**: 권한 없음 메시지
- **404 Not Found**: 리소스 없음 메시지
- **500 Internal Server Error**: 서버 오류 메시지
- **네트워크 오류**: 연결 확인 메시지

### 커스텀 에러 처리

```javascript
try {
  await apiClient.posture.savePostureData(data);
} catch (error) {
  // 커스텀 에러 처리
  if (error.message.includes("권한")) {
    // 권한 관련 처리
  } else {
    // 기타 에러 처리
  }
}
```

## 📋 API 응답 형식

### 성공 응답

```javascript
{
  success: true,
  data: { /* 응답 데이터 */ },
  message: "성공 메시지"
}
```

### 에러 응답

```javascript
{
  success: false,
  error: "에러 메시지",
  code: "ERROR_CODE"
}
```

## 🔄 마이그레이션 가이드

### 기존 코드에서 API 클라이언트로 전환

**기존 (로컬 저장소만 사용):**

```javascript
// 기존 방식
const history = JSON.parse(localStorage.getItem("postureHistory") || "[]");
history.push(newData);
localStorage.setItem("postureHistory", JSON.stringify(history));
```

**새로운 방식 (로컬 + 서버 동기화):**

```javascript
// 새로운 방식
const savedData = await apiHelpers.saveAndSyncPostureData(newData);
```

이렇게 하면 기존 로컬 저장소 기능을 유지하면서 백엔드와의 동기화도 자동으로 처리됩니다.

## 🚀 성능 최적화 팁

1. **캐싱 활용**: 자주 사용되는 데이터는 캐싱
2. **배치 처리**: 여러 요청을 한 번에 처리
3. **오프라인 지원**: 네트워크 없이도 기본 기능 동작
4. **에러 재시도**: 일시적 오류 시 자동 재시도

---

**문서 버전**: 1.0.0  
**최종 업데이트**: 2024년 12월  
**작성자**: Posture App Development Team
