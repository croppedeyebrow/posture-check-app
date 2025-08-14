import api from "./index.js";

// 자세 데이터 관련 API
export const postureApi = {
  // 자세 데이터 저장
  savePostureData: async (postureData) => {
    return await api.post("/posture/save", postureData);
  },

  // 자세 데이터 목록 조회
  getPostureHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/posture/history?${queryString}`
      : "/posture/history";
    return await api.get(endpoint);
  },

  // 특정 기간 자세 데이터 조회
  getPostureDataByPeriod: async (startDate, endDate, userId = null) => {
    const params = { start_date: startDate, end_date: endDate };
    if (userId) params.user_id = userId;

    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/posture/period?${queryString}`);
  },

  // 자세 통계 조회
  getPostureStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/posture/stats?${queryString}`
      : "/posture/stats";
    return await api.get(endpoint);
  },

  // 특정 자세 데이터 조회
  getPostureDataById: async (id) => {
    return await api.get(`/posture/${id}`);
  },

  // 자세 데이터 수정
  updatePostureData: async (id, updateData) => {
    return await api.put(`/posture/${id}`, updateData);
  },

  // 자세 데이터 삭제
  deletePostureData: async (id) => {
    return await api.delete(`/posture/${id}`);
  },

  // 여러 자세 데이터 삭제
  deleteMultiplePostureData: async (ids) => {
    return await api.post("/posture/delete-multiple", { ids });
  },

  // 자세 데이터 내보내기 (CSV)
  exportPostureDataCsv: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/posture/export/csv?${queryString}`
      : "/posture/export/csv";
    return await api.get(endpoint);
  },

  // 자세 데이터 내보내기 (PDF)
  exportPostureDataPdf: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/posture/export/pdf?${queryString}`
      : "/posture/export/pdf";
    return await api.get(endpoint);
  },

  // 실시간 자세 분석 시작
  startPostureAnalysis: async (analysisConfig = {}) => {
    return await api.post("/posture/analysis/start", analysisConfig);
  },

  // 실시간 자세 분석 중지
  stopPostureAnalysis: async (sessionId) => {
    return await api.post("/posture/analysis/stop", { session_id: sessionId });
  },

  // 자세 개선 추천 조회
  getPostureRecommendations: async (userId = null) => {
    const params = userId ? { user_id: userId } : {};
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/posture/recommendations?${queryString}`
      : "/posture/recommendations";
    return await api.get(endpoint);
  },

  // 자세 목표 설정
  setPostureGoal: async (goalData) => {
    return await api.post("/posture/goals", goalData);
  },

  // 자세 목표 조회
  getPostureGoals: async (userId = null) => {
    const params = userId ? { user_id: userId } : {};
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/posture/goals?${queryString}`
      : "/posture/goals";
    return await api.get(endpoint);
  },

  // 자세 목표 수정
  updatePostureGoal: async (goalId, updateData) => {
    return await api.put(`/posture/goals/${goalId}`, updateData);
  },

  // 자세 목표 삭제
  deletePostureGoal: async (goalId) => {
    return await api.delete(`/posture/goals/${goalId}`);
  },
};

export default postureApi;
