import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    chunkSizeWarningLimit: 1000, // 청크 크기 경고 한계를 1MB로 증가
    rollupOptions: {
      output: {
        manualChunks: {
          // MediaPipe 라이브러리들을 별도 청크로 분리
          mediapipe: [
            "@mediapipe/pose",
            "@mediapipe/drawing_utils",
            "@mediapipe/camera_utils",
          ],
          // React 관련 라이브러리들을 별도 청크로 분리
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // 차트 라이브러리를 별도 청크로 분리
          charts: ["recharts"],
          // 유틸리티 라이브러리들을 별도 청크로 분리
          utils: ["axios", "xlsx", "zustand"],
          // 스타일링 라이브러리를 별도 청크로 분리
          styling: ["styled-components"],
        },
      },
    },
  },
});
