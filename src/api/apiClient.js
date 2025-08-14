import api from "./index.js";
import authApi from "./authApi.js";
import postureApi from "./postureApi.js";
import userApi from "./userApi.js";
import { notificationApi, systemApi } from "./notificationApi.js";

// 통합 API 클라이언트
export const apiClient = {
  // 기본 API
  ...api,

  // 인증 관련 API
  auth: authApi,

  // 자세 데이터 관련 API
  posture: postureApi,

  // 사용자 관련 API
  user: userApi,

  // 알림 관련 API
  notification: notificationApi,

  // 시스템 관련 API
  system: systemApi,
};

// API 사용 예시를 위한 헬퍼 함수들
export const apiHelpers = {
  // 자세 데이터 저장 및 동기화
  saveAndSyncPostureData: async (postureData) => {
    try {
      // 로컬 저장 (기존 로직 유지)
      const localHistory = JSON.parse(
        localStorage.getItem("postureHistory") || "[]"
      );
      const newRecord = {
        ...postureData,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      };
      localHistory.push(newRecord);
      localStorage.setItem("postureHistory", JSON.stringify(localHistory));

      // 서버에 저장 (백엔드 연동)
      if (authApi.checkAuthStatus().isAuthenticated) {
        await postureApi.savePostureData(postureData);
      }

      return newRecord;
    } catch (error) {
      console.error("자세 데이터 저장 실패:", error);
      throw error;
    }
  },

  // 자세 데이터 로드 (로컬 + 서버)
  loadPostureData: async (params = {}) => {
    try {
      let data = [];

      // 로컬 데이터 로드
      const localHistory = JSON.parse(
        localStorage.getItem("postureHistory") || "[]"
      );
      data = [...localHistory];

      // 서버 데이터 로드 (인증된 경우)
      if (authApi.checkAuthStatus().isAuthenticated) {
        try {
          const serverData = await postureApi.getPostureHistory(params);
          // 서버 데이터와 로컬 데이터 병합
          data = [...data, ...serverData];
          // 중복 제거 및 정렬
          data = data.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.id === item.id)
          );
          data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
          console.warn("서버 데이터 로드 실패, 로컬 데이터만 사용:", error);
        }
      }

      return data;
    } catch (error) {
      console.error("자세 데이터 로드 실패:", error);
      return [];
    }
  },

  // 사용자 설정 동기화
  syncUserSettings: async () => {
    try {
      if (authApi.checkAuthStatus().isAuthenticated) {
        const serverSettings = await userApi.getUserSettings();
        const localSettings = JSON.parse(
          localStorage.getItem("userSettings") || "{}"
        );

        // 서버 설정을 로컬에 병합
        const mergedSettings = { ...localSettings, ...serverSettings };
        localStorage.setItem("userSettings", JSON.stringify(mergedSettings));

        return mergedSettings;
      }
    } catch (error) {
      console.error("사용자 설정 동기화 실패:", error);
    }
  },

  // 알림 처리
  handleNotifications: async () => {
    try {
      if (authApi.checkAuthStatus().isAuthenticated) {
        const notifications = await notificationApi.getNotifications({
          unread: true,
        });
        return notifications;
      }
    } catch (error) {
      console.error("알림 로드 실패:", error);
    }
    return [];
  },

  // 에러 처리 및 리포트
  handleError: async (error, context = {}) => {
    console.error("Error occurred:", error, context);

    try {
      // 에러 리포트 전송
      if (authApi.checkAuthStatus().isAuthenticated) {
        await systemApi.sendErrorReport({
          error: error.message,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        });
      }
    } catch (reportError) {
      console.error("Error report failed:", reportError);
    }
  },
};

// API 상태 관리
export const apiStatus = {
  isOnline: navigator.onLine,
  isAuthenticated: false,
  isLoading: false,
  lastSync: null,

  // 온라인 상태 감지
  initOnlineStatus: () => {
    window.addEventListener("online", () => {
      apiStatus.isOnline = true;
      console.log("네트워크 연결됨");
    });

    window.addEventListener("offline", () => {
      apiStatus.isOnline = false;
      console.log("네트워크 연결 끊김");
    });
  },

  // 인증 상태 업데이트
  updateAuthStatus: () => {
    const authStatus = authApi.checkAuthStatus();
    apiStatus.isAuthenticated = authStatus.isAuthenticated;
  },

  // 로딩 상태 관리
  setLoading: (loading) => {
    apiStatus.isLoading = loading;
  },

  // 마지막 동기화 시간 업데이트
  updateLastSync: () => {
    apiStatus.lastSync = new Date().toISOString();
  },
};

// 초기화
apiStatus.initOnlineStatus();
apiStatus.updateAuthStatus();

export default apiClient;
