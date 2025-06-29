import { useState, useRef, useCallback } from "react";

const useWebcam = (
  videoConstraints = { width: 640, height: 480, facingMode: "user" }
) => {
  const webcamRef = useRef(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);

  // 웹캠 시작
  const startWebcam = useCallback(() => {
    setIsStarted(true);
    setError(null);
  }, []);

  // 웹캠 중지
  const stopWebcam = useCallback(() => {
    setIsStarted(false);
    setIsActive(false);
    setError(null);
  }, []);

  // 웹캠 성공 핸들러
  const handleUserMedia = useCallback(() => {
    console.log("웹캠이 성공적으로 시작되었습니다.");
    setIsActive(true);
    setError(null);
  }, []);

  // 웹캠 오류 핸들러
  const handleUserMediaError = useCallback((error) => {
    console.error("웹캠 오류:", error);
    setIsStarted(false);
    setIsActive(false);
    setError(error);
  }, []);

  // 스크린샷 캡처
  const capture = useCallback(() => {
    if (webcamRef.current) {
      return webcamRef.current.getScreenshot();
    }
    return null;
  }, []);

  // 비디오 요소 가져오기
  const getVideo = useCallback(() => {
    if (webcamRef.current) {
      return webcamRef.current.video;
    }
    return null;
  }, []);

  return {
    webcamRef,
    isStarted,
    isActive,
    error,
    videoConstraints,
    startWebcam,
    stopWebcam,
    handleUserMedia,
    handleUserMediaError,
    capture,
    getVideo,
  };
};

export default useWebcam;
