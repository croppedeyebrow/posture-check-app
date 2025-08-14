import api from "./index.js";

// 사용자 설정 및 프로필 관련 API
export const userApi = {
  // 사용자 프로필 조회
  getUserProfile: async (userId = null) => {
    const endpoint = userId ? `/users/${userId}/profile` : "/users/profile";
    return await api.get(endpoint);
  },

  // 사용자 프로필 수정
  updateUserProfile: async (profileData, userId = null) => {
    const endpoint = userId ? `/users/${userId}/profile` : "/users/profile";
    return await api.put(endpoint, profileData);
  },

  // 사용자 설정 조회
  getUserSettings: async (userId = null) => {
    const endpoint = userId ? `/users/${userId}/settings` : "/users/settings";
    return await api.get(endpoint);
  },

  // 사용자 설정 수정
  updateUserSettings: async (settingsData, userId = null) => {
    const endpoint = userId ? `/users/${userId}/settings` : "/users/settings";
    return await api.put(endpoint, settingsData);
  },

  // 언어 설정 변경
  updateLanguage: async (language) => {
    return await api.patch("/users/settings/language", { language });
  },

  // 테마 설정 변경
  updateTheme: async (theme) => {
    return await api.patch("/users/settings/theme", { theme });
  },

  // 알림 설정 변경
  updateNotificationSettings: async (notificationSettings) => {
    return await api.patch(
      "/users/settings/notifications",
      notificationSettings
    );
  },

  // 자세 감지 설정 변경
  updatePostureDetectionSettings: async (detectionSettings) => {
    return await api.patch(
      "/users/settings/posture-detection",
      detectionSettings
    );
  },

  // 프로필 이미지 업로드
  uploadProfileImage: async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch(
      `${
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
      }/users/profile/image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("프로필 이미지 업로드에 실패했습니다.");
    }

    return await response.json();
  },

  // 사용자 통계 조회
  getUserStats: async (userId = null) => {
    const endpoint = userId ? `/users/${userId}/stats` : "/users/stats";
    return await api.get(endpoint);
  },

  // 사용자 활동 기록 조회
  getUserActivity: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/users/activity?${queryString}`
      : "/users/activity";
    return await api.get(endpoint);
  },

  // 사용자 목표 조회
  getUserGoals: async (userId = null) => {
    const endpoint = userId ? `/users/${userId}/goals` : "/users/goals";
    return await api.get(endpoint);
  },

  // 사용자 목표 설정
  setUserGoal: async (goalData) => {
    return await api.post("/users/goals", goalData);
  },

  // 사용자 목표 수정
  updateUserGoal: async (goalId, updateData) => {
    return await api.put(`/users/goals/${goalId}`, updateData);
  },

  // 사용자 목표 삭제
  deleteUserGoal: async (goalId) => {
    return await api.delete(`/users/goals/${goalId}`);
  },

  // 사용자 성취도 조회
  getUserAchievements: async (userId = null) => {
    const endpoint = userId
      ? `/users/${userId}/achievements`
      : "/users/achievements";
    return await api.get(endpoint);
  },

  // 사용자 배지 조회
  getUserBadges: async (userId = null) => {
    const endpoint = userId ? `/users/${userId}/badges` : "/users/badges";
    return await api.get(endpoint);
  },

  // 사용자 친구 목록 조회
  getUserFriends: async (userId = null) => {
    const endpoint = userId ? `/users/${userId}/friends` : "/users/friends";
    return await api.get(endpoint);
  },

  // 친구 추가
  addFriend: async (friendId) => {
    return await api.post("/users/friends", { friend_id: friendId });
  },

  // 친구 삭제
  removeFriend: async (friendId) => {
    return await api.delete(`/users/friends/${friendId}`);
  },

  // 사용자 검색
  searchUsers: async (query, params = {}) => {
    const searchParams = { ...params, q: query };
    const queryString = new URLSearchParams(searchParams).toString();
    return await api.get(`/users/search?${queryString}`);
  },

  // 사용자 팔로우
  followUser: async (userId) => {
    return await api.post(`/users/${userId}/follow`);
  },

  // 사용자 언팔로우
  unfollowUser: async (userId) => {
    return await api.delete(`/users/${userId}/follow`);
  },

  // 팔로워 목록 조회
  getFollowers: async (userId = null) => {
    const endpoint = userId ? `/users/${userId}/followers` : "/users/followers";
    return await api.get(endpoint);
  },

  // 팔로잉 목록 조회
  getFollowing: async (userId = null) => {
    const endpoint = userId ? `/users/${userId}/following` : "/users/following";
    return await api.get(endpoint);
  },

  // 사용자 차단
  blockUser: async (userId) => {
    return await api.post(`/users/${userId}/block`);
  },

  // 사용자 차단 해제
  unblockUser: async (userId) => {
    return await api.delete(`/users/${userId}/block`);
  },

  // 차단된 사용자 목록 조회
  getBlockedUsers: async () => {
    return await api.get("/users/blocked");
  },

  // 사용자 신고
  reportUser: async (userId, reportData) => {
    return await api.post(`/users/${userId}/report`, reportData);
  },
};

export default userApi;
