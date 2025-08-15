import api from "./index.js";

// 사용자 인증 관련 API
export const authApi = {
  // 사용자 로그인
  login: async (credentials) => {
    const response = await api.post("/api/v1/users/login", credentials);

    // 토큰을 로컬 스토리지에 저장
    if (response.access_token) {
      localStorage.setItem("authToken", response.access_token);
      localStorage.setItem("refreshToken", response.refresh_token);
      localStorage.setItem("user", JSON.stringify(response.user));
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
    const user = localStorage.getItem("user");

    return {
      isAuthenticated: !!token,
      user: user
        ? (() => {
            try {
              return JSON.parse(user);
            } catch (error) {
              console.error("Failed to parse user data:", error);
              localStorage.removeItem("user");
              return null;
            }
          })()
        : null,
      token,
    };
  },
};

export default authApi;
