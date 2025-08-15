// API 기본 설정
const getApiBaseUrl = () => {
  // 환경 변수에서 백엔드 타입 확인 (docker 또는 local)
  const backendType = import.meta.env.VITE_BACKEND_TYPE || "docker";

  if (backendType === "local") {
    return import.meta.env.VITE_LOCAL_API_URL || "http://localhost:8001";
  } else {
    return import.meta.env.VITE_DOCKER_API_URL || "http://localhost:8000";
  }
};

const API_BASE_URL = getApiBaseUrl();

// 공통 헤더 설정
const getHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

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
    // 네트워크 오류
    throw new Error("네트워크 연결을 확인해주세요.");
  } else {
    // 기타 오류
    throw new Error("알 수 없는 오류가 발생했습니다.");
  }
};

// 공통 API 요청 함수
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
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

    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
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
