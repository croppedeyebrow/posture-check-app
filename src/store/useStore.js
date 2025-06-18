import { create } from "zustand";

const useStore = create((set) => ({
  // 사용자 상태
  user: null,
  setUser: (user) => set({ user }),

  // 자세 감지 상태
  posture: {
    isDetecting: false,
    currentPosture: null,
    postureHistory: [],
  },
  setPosture: (posture) =>
    set((state) => ({
      posture: { ...state.posture, ...posture },
    })),

  // 알림 상태
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  // UI 상태
  ui: {
    isSidebarOpen: false,
    theme: "light",
  },
  setUI: (ui) =>
    set((state) => ({
      ui: { ...state.ui, ...ui },
    })),
}));

export default useStore;
