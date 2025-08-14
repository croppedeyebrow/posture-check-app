// API 클라이언트 사용 예시
// 이 파일은 실제 사용 예시를 보여주는 참고용 파일입니다.

import { apiClient, apiHelpers, apiStatus } from "./apiClient.js";

// ============================================================================
// 1. PostureDetection 컴포넌트에서 사용 예시
// ============================================================================

export const PostureDetectionExample = {
  // 자세 분석 결과 저장
  savePostureAnalysis: async (postureData) => {
    try {
      // 자세 데이터 저장 및 동기화
      const savedData = await apiHelpers.saveAndSyncPostureData({
        score: postureData.score,
        neckAngle: postureData.neckAngle,
        shoulderSlope: postureData.shoulderSlope,
        headForward: postureData.headForward,
        shoulderHeightDiff: postureData.shoulderHeightDiff,
        cervicalLordosis: postureData.cervicalLordosis,
        forwardHeadDistance: postureData.forwardHeadDistance,
        headTilt: postureData.headTilt,
        headRotation: postureData.headRotation,
        shoulderForwardMovement: postureData.shoulderForwardMovement,
        issues: postureData.issues || [],
        timestamp: new Date().toISOString(),
      });

      console.log("자세 데이터 저장 완료:", savedData);
      return savedData;
    } catch (error) {
      await apiHelpers.handleError(error, {
        context: "posture-detection",
        postureData,
      });
      throw error;
    }
  },

  // 실시간 자세 분석 세션 시작
  startAnalysisSession: async (config = {}) => {
    try {
      const session = await apiClient.posture.startPostureAnalysis({
        modelComplexity: config.modelComplexity || 1,
        minDetectionConfidence: config.minDetectionConfidence || 0.5,
        minTrackingConfidence: config.minTrackingConfidence || 0.5,
        timestamp: new Date().toISOString(),
      });

      console.log("분석 세션 시작:", session);
      return session;
    } catch (error) {
      await apiHelpers.handleError(error, {
        context: "analysis-session-start",
      });
      throw error;
    }
  },

  // 실시간 자세 분석 세션 중지
  stopAnalysisSession: async (sessionId) => {
    try {
      await apiClient.posture.stopPostureAnalysis(sessionId);
      console.log("분석 세션 중지 완료");
    } catch (error) {
      await apiHelpers.handleError(error, { context: "analysis-session-stop" });
    }
  },
};

// ============================================================================
// 2. PostureData 컴포넌트에서 사용 예시
// ============================================================================

export const PostureDataExample = {
  // 자세 데이터 로드
  loadPostureData: async (filters = {}) => {
    try {
      apiStatus.setLoading(true);

      const data = await apiHelpers.loadPostureData({
        start_date: filters.startDate,
        end_date: filters.endDate,
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      });

      console.log("자세 데이터 로드 완료:", data.length, "개");
      return data;
    } catch (error) {
      await apiHelpers.handleError(error, { context: "data-loading", filters });
      return [];
    } finally {
      apiStatus.setLoading(false);
    }
  },

  // 자세 통계 조회
  loadPostureStats: async (period = "month") => {
    try {
      const stats = await apiClient.posture.getPostureStats({
        period,
        include_trends: true,
      });

      console.log("자세 통계 로드 완료:", stats);
      return stats;
    } catch (error) {
      await apiHelpers.handleError(error, { context: "stats-loading", period });
      return null;
    }
  },

  // 데이터 내보내기
  exportData: async (format, filters = {}) => {
    try {
      let result;

      if (format === "csv") {
        result = await apiClient.posture.exportPostureDataCsv(filters);
      } else if (format === "pdf") {
        result = await apiClient.posture.exportPostureDataPdf(filters);
      }

      console.log(`${format.toUpperCase()} 내보내기 완료:`, result);
      return result;
    } catch (error) {
      await apiHelpers.handleError(error, {
        context: "data-export",
        format,
        filters,
      });
      throw error;
    }
  },

  // 데이터 삭제
  deletePostureData: async (dataIds) => {
    try {
      if (Array.isArray(dataIds) && dataIds.length > 1) {
        await apiClient.posture.deleteMultiplePostureData(dataIds);
      } else {
        const id = Array.isArray(dataIds) ? dataIds[0] : dataIds;
        await apiClient.posture.deletePostureData(id);
      }

      console.log("데이터 삭제 완료");
    } catch (error) {
      await apiHelpers.handleError(error, {
        context: "data-deletion",
        dataIds,
      });
      throw error;
    }
  },
};

// ============================================================================
// 3. 사용자 설정 관련 예시
// ============================================================================

export const UserSettingsExample = {
  // 사용자 설정 로드
  loadUserSettings: async () => {
    try {
      const settings = await apiHelpers.syncUserSettings();
      console.log("사용자 설정 로드 완료:", settings);
      return settings;
    } catch (error) {
      await apiHelpers.handleError(error, { context: "settings-loading" });
      return {};
    }
  },

  // 언어 설정 변경
  updateLanguage: async (language) => {
    try {
      await apiClient.user.updateLanguage(language);

      // 로컬 설정도 업데이트
      const localSettings = JSON.parse(
        localStorage.getItem("userSettings") || "{}"
      );
      localSettings.language = language;
      localStorage.setItem("userSettings", JSON.stringify(localSettings));

      console.log("언어 설정 변경 완료:", language);
    } catch (error) {
      await apiHelpers.handleError(error, {
        context: "language-update",
        language,
      });
      throw error;
    }
  },

  // 테마 설정 변경
  updateTheme: async (theme) => {
    try {
      await apiClient.user.updateTheme(theme);

      // 로컬 설정도 업데이트
      const localSettings = JSON.parse(
        localStorage.getItem("userSettings") || "{}"
      );
      localSettings.theme = theme;
      localStorage.setItem("userSettings", JSON.stringify(localSettings));

      console.log("테마 설정 변경 완료:", theme);
    } catch (error) {
      await apiHelpers.handleError(error, { context: "theme-update", theme });
      throw error;
    }
  },

  // 알림 설정 변경
  updateNotificationSettings: async (settings) => {
    try {
      await apiClient.user.updateNotificationSettings(settings);
      console.log("알림 설정 변경 완료:", settings);
    } catch (error) {
      await apiHelpers.handleError(error, {
        context: "notification-settings",
        settings,
      });
      throw error;
    }
  },
};

// ============================================================================
// 4. 알림 관련 예시
// ============================================================================

export const NotificationExample = {
  // 알림 로드
  loadNotifications: async () => {
    try {
      const notifications = await apiHelpers.handleNotifications();
      console.log("알림 로드 완료:", notifications.length, "개");
      return notifications;
    } catch (error) {
      await apiHelpers.handleError(error, { context: "notification-loading" });
      return [];
    }
  },

  // 알림 읽음 처리
  markAsRead: async (notificationIds) => {
    try {
      if (Array.isArray(notificationIds) && notificationIds.length > 1) {
        await apiClient.notification.markMultipleNotificationsAsRead(
          notificationIds
        );
      } else {
        const id = Array.isArray(notificationIds)
          ? notificationIds[0]
          : notificationIds;
        await apiClient.notification.markNotificationAsRead(id);
      }

      console.log("알림 읽음 처리 완료");
    } catch (error) {
      await apiHelpers.handleError(error, {
        context: "notification-mark-read",
        notificationIds,
      });
    }
  },

  // 알림 설정 조회
  loadNotificationSettings: async () => {
    try {
      const settings = await apiClient.notification.getNotificationSettings();
      console.log("알림 설정 로드 완료:", settings);
      return settings;
    } catch (error) {
      await apiHelpers.handleError(error, {
        context: "notification-settings-loading",
      });
      return {};
    }
  },
};

// ============================================================================
// 5. 인증 관련 예시
// ============================================================================

export const AuthExample = {
  // 로그인
  login: async (credentials) => {
    try {
      const response = await apiClient.auth.login(credentials);
      console.log("로그인 성공:", response.user);

      // 인증 상태 업데이트
      apiStatus.updateAuthStatus();

      return response;
    } catch (error) {
      console.error("로그인 실패:", error.message);
      throw error;
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      await apiClient.auth.logout();
      console.log("로그아웃 완료");

      // 인증 상태 업데이트
      apiStatus.updateAuthStatus();
    } catch (error) {
      console.error("로그아웃 실패:", error.message);
    }
  },

  // 인증 상태 확인
  checkAuth: () => {
    const authStatus = apiClient.auth.checkAuthStatus();
    console.log("인증 상태:", authStatus);
    return authStatus;
  },

  // 토큰 갱신
  refreshToken: async () => {
    try {
      const response = await apiClient.auth.refreshToken();
      console.log("토큰 갱신 완료");

      // 인증 상태 업데이트
      apiStatus.updateAuthStatus();

      return response;
    } catch (error) {
      console.error("토큰 갱신 실패:", error.message);
      throw error;
    }
  },
};

// ============================================================================
// 6. 시스템 관련 예시
// ============================================================================

export const SystemExample = {
  // 시스템 상태 확인
  checkSystemStatus: async () => {
    try {
      const status = await apiClient.system.getSystemStatus();
      console.log("시스템 상태:", status);
      return status;
    } catch (error) {
      await apiHelpers.handleError(error, { context: "system-status-check" });
      return null;
    }
  },

  // 파일 업로드
  uploadFile: async (file, type = "general") => {
    try {
      const result = await apiClient.system.uploadFile(file, type);
      console.log("파일 업로드 완료:", result);
      return result;
    } catch (error) {
      await apiHelpers.handleError(error, { context: "file-upload", type });
      throw error;
    }
  },

  // 피드백 전송
  sendFeedback: async (feedbackData) => {
    try {
      const result = await apiClient.system.sendFeedback(feedbackData);
      console.log("피드백 전송 완료:", result);
      return result;
    } catch (error) {
      await apiHelpers.handleError(error, {
        context: "feedback-send",
        feedbackData,
      });
      throw error;
    }
  },
};

// ============================================================================
// 7. 통합 사용 예시
// ============================================================================

export const IntegratedExample = {
  // 앱 초기화
  initializeApp: async () => {
    try {
      console.log("앱 초기화 시작...");

      // 1. 시스템 상태 확인
      const systemStatus = await SystemExample.checkSystemStatus();
      if (!systemStatus?.healthy) {
        throw new Error("시스템 상태가 정상이 아닙니다.");
      }

      // 2. 인증 상태 확인
      const authStatus = AuthExample.checkAuth();

      // 3. 사용자 설정 동기화 (인증된 경우)
      if (authStatus.isAuthenticated) {
        await UserSettingsExample.loadUserSettings();
        await NotificationExample.loadNotifications();
      }

      // 4. 마지막 동기화 시간 업데이트
      apiStatus.updateLastSync();

      console.log("앱 초기화 완료");
      return { systemStatus, authStatus };
    } catch (error) {
      await apiHelpers.handleError(error, { context: "app-initialization" });
      throw error;
    }
  },

  // 자세 분석 완료 후 처리
  handlePostureAnalysisComplete: async (postureData) => {
    try {
      console.log("자세 분석 완료 처리 시작...");

      // 1. 자세 데이터 저장
      const savedData = await PostureDetectionExample.savePostureAnalysis(
        postureData
      );

      // 2. 통계 업데이트
      const stats = await PostureDataExample.loadPostureStats("day");

      // 3. 알림 확인
      const notifications = await NotificationExample.loadNotifications();

      // 4. 성취도 확인 (목표 달성 시)
      if (postureData.score >= 90) {
        // 높은 점수 달성 시 특별 처리
        console.log("높은 점수 달성!");
      }

      console.log("자세 분석 완료 처리 완료");
      return { savedData, stats, notifications };
    } catch (error) {
      await apiHelpers.handleError(error, {
        context: "posture-analysis-complete",
        postureData,
      });
      throw error;
    }
  },
};

export default {
  PostureDetectionExample,
  PostureDataExample,
  UserSettingsExample,
  NotificationExample,
  AuthExample,
  SystemExample,
  IntegratedExample,
};
