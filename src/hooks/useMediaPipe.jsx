import { useRef, useCallback } from "react";

const useMediaPipe = () => {
  const mediaPipeRef = useRef(null);
  const poseRef = useRef(null);

  // MediaPipe 라이브러리들을 동적으로 로드
  const loadMediaPipe = useCallback(async () => {
    try {
      const [{ Pose }, { drawConnectors, drawLandmarks }] = await Promise.all([
        import("@mediapipe/pose"),
        import("@mediapipe/drawing_utils"),
      ]);

      mediaPipeRef.current = { Pose, drawConnectors, drawLandmarks };
      return { Pose, drawConnectors, drawLandmarks };
    } catch (error) {
      console.error("MediaPipe 라이브러리 로드 실패:", error);
      throw error;
    }
  }, []);

  // Pose 초기화
  const initializePose = useCallback(
    async (onResults) => {
      if (!mediaPipeRef.current) {
        await loadMediaPipe();
      }

      const { Pose } = mediaPipeRef.current;

      poseRef.current = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      poseRef.current.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseRef.current.onResults(onResults);
    },
    [loadMediaPipe]
  );

  // Pose 정리
  const cleanupPose = useCallback(() => {
    if (poseRef.current) {
      poseRef.current.close();
    }
  }, []);

  // 프레임 처리
  const processFrame = useCallback(async (video) => {
    if (
      poseRef.current &&
      video &&
      video.readyState === video.HAVE_ENOUGH_DATA
    ) {
      await poseRef.current.send({ image: video });
    }
  }, []);

  return {
    mediaPipeRef,
    poseRef,
    loadMediaPipe,
    initializePose,
    cleanupPose,
    processFrame,
  };
};

export default useMediaPipe;
