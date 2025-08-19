import api from "./index.js";

// 사용자 인증 관련 API
export const authApi = {
  // 사용자 로그인
  login: async (credentials) => {
    const response = await api.post("/api/v1/users/login", credentials);

    console.log("로그인 응답:", response); // 디버깅용
    console.log("응답 타입:", typeof response);
    console.log("응답 키들:", Object.keys(response || {}));

    // 토큰을 로컬 스토리지에 저장
    if (response.access_token) {
      localStorage.setItem("authToken", response.access_token);
      localStorage.setItem("refreshToken", response.refresh_token);

      // 사용자 정보가 있는지 확인 후 저장 (다양한 응답 구조 대응)
      let userInfo = null;

      if (response.user && typeof response.user === "object") {
        userInfo = response.user;
        console.log("response.user에서 사용자 정보 발견:", userInfo);
      } else if (
        response.data &&
        response.data.user &&
        typeof response.data.user === "object"
      ) {
        userInfo = response.data.user;
        console.log("response.data.user에서 사용자 정보 발견:", userInfo);
      } else if (response.username || response.email || response.user_id) {
        // 사용자 정보가 응답 루트에 직접 있는 경우
        userInfo = {
          id: response.user_id || response.id || 1,
          username: response.username || credentials.username || "사용자",
          email: response.email || credentials.email || "",
        };
        console.log("응답 루트에서 사용자 정보 구성:", userInfo);
      } else {
        console.warn("사용자 정보가 응답에 없습니다. 기본값 사용");
        // 기본 사용자 정보 생성
        userInfo = {
          id: 1,
          username:
            credentials.username ||
            credentials.email?.split("@")[0] ||
            "사용자",
          email: credentials.email || "",
        };
        console.log("기본 사용자 정보 생성:", userInfo);
      }

      if (userInfo) {
        localStorage.setItem("user", JSON.stringify(userInfo));
        console.log("사용자 정보 저장 완료:", userInfo);
      }

      // 인증 상태 변경 이벤트 발생
      window.dispatchEvent(new Event("authStateChanged"));
    }

    return response;
  },

  // 사용자 로그아웃
  logout: async () => {
    try {
      // 서버에 로그아웃 요청
      await api.post("/api/v1/users/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // 로컬 스토리지 정리
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      console.log("로그아웃 완료, localStorage 정리됨");

      // 인증 상태 변경 이벤트 발생
      window.dispatchEvent(new Event("authStateChanged"));
    }
  },

  // 사용자 회원가입
  register: async (userData) => {
    return await api.post("/api/v1/users/register", userData);
  },

  // 토큰 갱신
  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("Refresh token not found");
    }

    const response = await api.post("/api/v1/users/refresh", {
      refresh_token: refreshToken,
    });

    if (response.access_token) {
      localStorage.setItem("authToken", response.access_token);
      if (response.refresh_token) {
        localStorage.setItem("refreshToken", response.refresh_token);
      }
    }

    return response;
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async () => {
    return await api.get("/api/v1/users/me");
  },

  // 사용자 프로필 수정
  updateProfile: async (profileData) => {
    return await api.put("/api/v1/users/profile", profileData);
  },

  // 비밀번호 변경
  changePassword: async (passwordData) => {
    return await api.post("/api/v1/users/change-password", passwordData);
  },

  // 비밀번호 재설정 요청
  requestPasswordReset: async (email) => {
    return await api.post("/api/v1/users/forgot-password", { email });
  },

  // 비밀번호 재설정
  resetPassword: async (resetData) => {
    return await api.post("/api/v1/users/reset-password", resetData);
  },

  // 이메일 인증
  verifyEmail: async (token) => {
    return await api.post("/api/v1/users/verify-email", { token });
  },

  // 이메일 재인증 요청
  resendVerificationEmail: async () => {
    return await api.post("/api/v1/users/resend-verification");
  },

  // 소셜 로그인 (Google, GitHub 등)
  socialLogin: async (provider, code) => {
    return await api.post(`/api/v1/users/${provider}`, { code });
  },

  // 계정 삭제
  deleteAccount: async (password) => {
    const response = await api.delete("/api/v1/users/account", { password });

    // 계정 삭제 성공 시 로컬 스토리지 정리
    if (response.success) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }

    return response;
  },

  // 로그인 상태 확인
  checkAuthStatus: () => {
    const token = localStorage.getItem("authToken");
    const userString = localStorage.getItem("user");

    let user = null;
    if (userString && userString !== "undefined" && userString !== "null") {
      try {
        user = JSON.parse(userString);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        console.error("User string value:", userString);
        localStorage.removeItem("user");
        user = null;
      }
    }

    return {
      isAuthenticated: !!token,
      user,
      token,
    };
  },
};

export default authApi;
