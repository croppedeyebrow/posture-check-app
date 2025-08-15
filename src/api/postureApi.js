import api from "./index.js";

// 자세 데이터 관련 API
export const postureApi = {
  // 자세 데이터 저장
  savePostureData: async (postureData) => {
    // 프론트엔드 데이터를 그대로 전송 (백엔드에서 변환 처리)
    const backendData = {
      // user_id를 데이터에 포함
      userId: postureData.userId || 1, // 기본값 1, 실제로는 로그인된 사용자 ID 사용

      // 프론트엔드 원본 필드명 그대로 사용
      neckAngle: postureData.neckAngle,
      shoulderSlope: postureData.shoulderSlope,
      headForward: postureData.headForward,
      shoulderHeightDiff: postureData.shoulderHeightDiff,
      score: postureData.score,
      cervicalLordosis: postureData.cervicalLordosis,
      forwardHeadDistance: postureData.forwardHeadDistance,
      headTilt: postureData.headTilt,
      shoulderForwardMovement: postureData.shoulderForwardMovement,
      headRotation: postureData.headRotation,
      issues: postureData.issues,
      sessionId: postureData.sessionId || `session_${Date.now()}`,
      deviceInfo: postureData.deviceInfo || navigator.userAgent,
    };

    // 디버깅을 위해 전송할 데이터 출력
    console.log("전송할 자세 데이터:", backendData);

    return await api.post(`/api/v1/posture/save`, backendData);
  },

  // 자세 데이터 목록 조회
  getPostureHistory: async (params = {}) => {
    // user_id가 없으면 기본값 추가
    if (!params.user_id) {
      params.user_id = 1; // 기본값 1, 실제로는 로그인된 사용자 ID 사용
    }

    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/v1/posture/records?${queryString}`
      : "/api/v1/posture/records";
    return await api.get(endpoint);
  },

  // 특정 기간 자세 데이터 조회
  getPostureDataByPeriod: async (startDate, endDate, userId = null) => {
    const params = { start_date: startDate, end_date: endDate };
    if (userId) params.user_id = userId;

    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/api/v1/posture/records?${queryString}`);
  },

  // 자세 통계 조회
  getPostureStats: async (params = {}) => {
    // user_id가 없으면 기본값 추가
    if (!params.user_id) {
      params.user_id = 1; // 기본값 1, 실제로는 로그인된 사용자 ID 사용
    }

    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/v1/posture/stats?${queryString}`
      : "/api/v1/posture/stats";
    return await api.get(endpoint);
  },

  // 특정 자세 데이터 조회
  getPostureDataById: async (id) => {
    return await api.get(`/api/v1/posture/records/${id}`);
  },

  // 자세 데이터 수정
  updatePostureData: async (id, updateData) => {
    return await api.put(`/api/v1/posture/records/${id}`, updateData);
  },

  // 자세 데이터 삭제
  deletePostureData: async (id) => {
    return await api.delete(`/api/v1/posture/records/${id}`);
  },

  // 여러 자세 데이터 삭제
  deleteMultiplePostureData: async (ids) => {
    return await api.post("/api/v1/posture/records/delete-multiple", {
      ids,
    });
  },

  // 자세 데이터 내보내기 (CSV)
  exportPostureDataCsv: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/v1/posture/export/csv?${queryString}`
      : "/api/v1/posture/export/csv";
    return await api.get(endpoint);
  },

  // 자세 데이터 내보내기 (PDF)
  exportPostureDataPdf: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/v1/posture/records/export/pdf?${queryString}`
      : "/api/v1/posture/records/export/pdf";
    return await api.get(endpoint);
  },

  // 실시간 자세 분석 시작
  startPostureAnalysis: async (analysisConfig = {}) => {
    return await api.post("/api/v1/posture/analysis/start", analysisConfig);
  },

  // 실시간 자세 분석 중지
  stopPostureAnalysis: async (sessionId) => {
    return await api.post("/api/v1/posture/analysis/stop", {
      session_id: sessionId,
    });
  },

  // 자세 개선 추천 조회
  getPostureRecommendations: async (userId = null) => {
    const params = userId ? { user_id: userId } : {};
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/v1/posture/recommendations?${queryString}`
      : "/api/v1/posture/recommendations";
    return await api.get(endpoint);
  },

  // 자세 목표 설정
  setPostureGoal: async (goalData) => {
    return await api.post("/api/v1/posture/goals", goalData);
  },

  // 자세 목표 조회
  getPostureGoals: async (userId = null) => {
    const params = userId ? { user_id: userId } : {};
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/v1/posture/goals?${queryString}`
      : "/api/v1/posture/goals";
    return await api.get(endpoint);
  },

  // 자세 목표 수정
  updatePostureGoal: async (goalId, updateData) => {
    return await api.put(`/api/v1/posture/goals/${goalId}`, updateData);
  },

  // 자세 목표 삭제
  deletePostureGoal: async (goalId) => {
    return await api.delete(`/api/v1/posture/goals/${goalId}`);
  },
};

export default postureApi;
