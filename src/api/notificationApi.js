import api from "./index.js";

// 알림 및 시스템 관련 API
export const notificationApi = {
  // 사용자 알림 목록 조회
  getNotifications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/notifications?${queryString}`
      : "/notifications";
    return await api.get(endpoint);
  },

  // 특정 알림 조회
  getNotificationById: async (notificationId) => {
    return await api.get(`/notifications/${notificationId}`);
  },

  // 알림 읽음 처리
  markNotificationAsRead: async (notificationId) => {
    return await api.patch(`/notifications/${notificationId}/read`);
  },

  // 여러 알림 읽음 처리
  markMultipleNotificationsAsRead: async (notificationIds) => {
    return await api.patch("/notifications/read-multiple", {
      notification_ids: notificationIds,
    });
  },

  // 모든 알림 읽음 처리
  markAllNotificationsAsRead: async () => {
    return await api.patch("/notifications/read-all");
  },

  // 알림 삭제
  deleteNotification: async (notificationId) => {
    return await api.delete(`/notifications/${notificationId}`);
  },

  // 여러 알림 삭제
  deleteMultipleNotifications: async (notificationIds) => {
    return await api.post("/notifications/delete-multiple", {
      notification_ids: notificationIds,
    });
  },

  // 모든 알림 삭제
  deleteAllNotifications: async () => {
    return await api.delete("/notifications/delete-all");
  },

  // 알림 설정 조회
  getNotificationSettings: async () => {
    return await api.get("/notifications/settings");
  },

  // 알림 설정 수정
  updateNotificationSettings: async (settings) => {
    return await api.put("/notifications/settings", settings);
  },

  // 푸시 알림 토큰 등록
  registerPushToken: async (token, platform = "web") => {
    return await api.post("/notifications/push-token", { token, platform });
  },

  // 푸시 알림 토큰 삭제
  unregisterPushToken: async (token) => {
    return await api.delete("/notifications/push-token", { token });
  },

  // 테스트 알림 전송
  sendTestNotification: async (notificationData) => {
    return await api.post("/notifications/test", notificationData);
  },
};

// 시스템 관련 API
export const systemApi = {
  // 시스템 상태 확인
  getSystemStatus: async () => {
    return await api.get("/system/status");
  },

  // 서버 정보 조회
  getServerInfo: async () => {
    return await api.get("/system/info");
  },

  // API 버전 조회
  getApiVersion: async () => {
    return await api.get("/system/version");
  },

  // 지원하는 언어 목록 조회
  getSupportedLanguages: async () => {
    return await api.get("/system/languages");
  },

  // 지원하는 테마 목록 조회
  getSupportedThemes: async () => {
    return await api.get("/system/themes");
  },

  // 파일 업로드
  uploadFile: async (file, type = "general") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await fetch(
      `${
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
      }/system/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("파일 업로드에 실패했습니다.");
    }

    return await response.json();
  },

  // 파일 삭제
  deleteFile: async (fileId) => {
    return await api.delete(`/system/files/${fileId}`);
  },

  // 파일 목록 조회
  getFileList: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/system/files?${queryString}`
      : "/system/files";
    return await api.get(endpoint);
  },

  // 로그 조회
  getLogs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/system/logs?${queryString}`
      : "/system/logs";
    return await api.get(endpoint);
  },

  // 에러 리포트 전송
  sendErrorReport: async (errorData) => {
    return await api.post("/system/error-report", errorData);
  },

  // 피드백 전송
  sendFeedback: async (feedbackData) => {
    return await api.post("/system/feedback", feedbackData);
  },

  // 문의사항 전송
  sendInquiry: async (inquiryData) => {
    return await api.post("/system/inquiry", inquiryData);
  },

  // 공지사항 조회
  getAnnouncements: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/system/announcements?${queryString}`
      : "/system/announcements";
    return await api.get(endpoint);
  },

  // 특정 공지사항 조회
  getAnnouncementById: async (announcementId) => {
    return await api.get(`/system/announcements/${announcementId}`);
  },

  // FAQ 조회
  getFaqs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/system/faqs?${queryString}`
      : "/system/faqs";
    return await api.get(endpoint);
  },

  // FAQ 카테고리 조회
  getFaqCategories: async () => {
    return await api.get("/system/faqs/categories");
  },

  // 특정 카테고리의 FAQ 조회
  getFaqsByCategory: async (category) => {
    return await api.get(`/system/faqs/categories/${category}`);
  },

  // 도움말 조회
  getHelp: async (topic = null) => {
    const endpoint = topic ? `/system/help/${topic}` : "/system/help";
    return await api.get(endpoint);
  },

  // 도움말 검색
  searchHelp: async (query) => {
    return await api.get(`/system/help/search?q=${encodeURIComponent(query)}`);
  },
};

export default {
  notification: notificationApi,
  system: systemApi,
};
