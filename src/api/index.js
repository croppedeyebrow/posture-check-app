// 공통 헤더 설정
const getHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// 백엔드 서버 URL 설정
const getBackendUrls = () => {
  // 환경 변수에서 백엔드 URL 가져오기
  const dockerUrl = import.meta.env.VITE_DOCKER_API_URL;
  const localUrl = import.meta.env.VITE_LOCAL_API_URL;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const productionUrl = import.meta.env.VITE_PRODUCTION_API_URL;

  // 배포 환경에서는 실제 백엔드 서버 URL 사용
  if (import.meta.env.PROD) {
    // 프로덕션 환경에서는 실제 백엔드 서버 URL을 사용
    // VITE_API_BASE_URL을 우선적으로 사용
    if (baseUrl) {
      return [baseUrl];
    }
    // VITE_PRODUCTION_API_URL을 대안으로 사용
    if (productionUrl) {
      return [productionUrl];
    }
  }

  // 개발 환경에서는 로컬 서버들 사용
  const urls = [];
  if (dockerUrl) urls.push(dockerUrl);
  if (localUrl) urls.push(localUrl);
  if (baseUrl) urls.push(baseUrl);

  // 개발 환경에서 환경 변수가 설정되지 않은 경우 기본값 추가
  if (urls.length === 0) {
    urls.push("http://localhost:8000", "http://localhost:8001");
  } else {
    // 환경 변수가 설정되어 있지만 기본 localhost 서버들도 추가
    // 중복 제거를 위해 확인 후 추가
    if (!urls.includes("http://localhost:8000")) {
      urls.push("http://localhost:8000");
    }
    if (!urls.includes("http://localhost:8001")) {
      urls.push("http://localhost:8001");
    }
  }

  return urls;
};

// API 연결 상태 확인 함수
export const checkApiConnection = async () => {
  const servers = getBackendUrls();
  const results = [];

  console.log("🔍 API 연결 상태 확인 중...");
  console.log("📋 설정된 서버 목록:", servers);

  for (const server of servers) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${server}/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(5000), // 5초 타임아웃
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        results.push({
          server,
          status: "✅ 연결 성공",
          responseTime: `${responseTime}ms`,
          data,
        });
        console.log(`✅ ${server} - 연결 성공 (${responseTime}ms)`);
      } else {
        results.push({
          server,
          status: "❌ HTTP 오류",
          responseTime: `${responseTime}ms`,
          error: `HTTP ${response.status}`,
        });
        console.log(`❌ ${server} - HTTP 오류 (${response.status})`);
      }
    } catch (error) {
      results.push({
        server,
        status: "❌ 연결 실패",
        responseTime: "N/A",
        error: error.message,
      });
      console.log(`❌ ${server} - 연결 실패: ${error.message}`);
    }
  }

  // 전체 결과 요약
  const successCount = results.filter((r) => r.status.includes("성공")).length;
  const totalCount = results.length;

  console.log(`\n📊 API 연결 상태 요약:`);
  console.log(`✅ 성공: ${successCount}/${totalCount}`);
  console.log(`❌ 실패: ${totalCount - successCount}/${totalCount}`);

  if (successCount === 0) {
    console.error("🚨 모든 서버에 연결할 수 없습니다!");
    console.log("💡 해결 방법:");
    console.log("1. 백엔드 서버가 실행 중인지 확인");
    console.log(
      "2. 환경 변수 VITE_PRODUCTION_API_URL이 올바르게 설정되었는지 확인"
    );
    console.log("3. CORS 설정이 올바른지 확인");
  } else {
    console.log("🎉 최소 하나의 서버에 연결되었습니다!");
  }

  return results;
};

// 환경 변수 정보 출력 함수
export const logEnvironmentInfo = () => {
  console.log("🔧 환경 변수 정보:");
  console.log("📱 환경:", import.meta.env.MODE);
  console.log("🚀 프로덕션:", import.meta.env.PROD);
  console.log("🔧 개발:", import.meta.env.DEV);
  console.log(
    "🌐 VITE_PRODUCTION_API_URL:",
    import.meta.env.VITE_PRODUCTION_API_URL
  );
  console.log("🐳 VITE_DOCKER_API_URL:", import.meta.env.VITE_DOCKER_API_URL);
  console.log("💻 VITE_LOCAL_API_URL:", import.meta.env.VITE_LOCAL_API_URL);
  console.log("🔗 VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
};

// 전역 객체에 API 테스트 함수 추가 (개발자 도구에서 접근 가능)
if (typeof window !== "undefined") {
  window.apiTest = {
    checkConnection: checkApiConnection,
    logEnvironment: logEnvironmentInfo,
    getBackendUrls: getBackendUrls,
  };

  console.log("🔧 API 테스트 함수가 전역 객체에 추가되었습니다:");
  console.log("📝 사용법:");
  console.log("  - apiTest.checkConnection() : API 연결 상태 확인");
  console.log("  - apiTest.logEnvironment() : 환경 변수 정보 출력");
  console.log("  - apiTest.getBackendUrls() : 설정된 백엔드 URL 목록 확인");
}

// 공통 에러 처리
const handleApiError = (error) => {
  console.error("API Error:", error);

  if (error.response) {
    // 서버 응답이 있는 경우
    const { status, data } = error.response;

    switch (status) {
      case 401:
        // 인증 실패 - 로그인 페이지로 리다이렉트
        localStorage.removeItem("authToken");
        window.location.href = "/login";
        break;
      case 403:
        // 권한 없음
        throw new Error("접근 권한이 없습니다.");
      case 404:
        // 리소스 없음
        throw new Error("요청한 리소스를 찾을 수 없습니다.");
      case 500:
        // 서버 오류
        throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      default:
        // 기타 오류
        throw new Error(data?.message || "알 수 없는 오류가 발생했습니다.");
    }
  } else if (error.request) {
    // 네트워크 오류 - 백엔드 서버가 실행되지 않았을 가능성
    throw new Error(
      "백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요."
    );
  } else {
    // 기타 오류
    throw new Error("알 수 없는 오류가 발생했습니다.");
  }
};

// 공통 API 요청 함수
const apiRequest = async (endpoint, options = {}) => {
  const servers = getBackendUrls();

  for (const server of servers) {
    try {
      const url = `${server}${endpoint}`;
      const config = {
        headers: getHeaders(),
        ...options,
      };

      const response = await fetch(url, config);

      if (!response.ok) {
        const error = new Error("API request failed");
        error.response = {
          status: response.status,
          data: await response.json().catch(() => ({})),
        };
        throw error;
      }

      console.log(`백엔드 서버 연결 성공: ${server}`);
      return await response.json();
    } catch {
      console.log(`서버 ${server} 연결 실패, 다른 서버 시도...`);
      continue; // 다음 서버로 시도
    }
  }

  // 모든 서버 연결 실패
  handleApiError(new Error("모든 백엔드 서버에 연결할 수 없습니다."));
};

// HTTP 메서드별 함수들
export const api = {
  get: (endpoint) => apiRequest(endpoint),

  post: (endpoint, data) =>
    apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: (endpoint, data) =>
    apiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: (endpoint, data) =>
    apiRequest(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (endpoint) =>
    apiRequest(endpoint, {
      method: "DELETE",
    }),
};

export default api;
