import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Webcam from "react-webcam";
// 커스텀 훅들 import
import useMediaPipe from "../hooks/useMediaPipe.jsx";
import usePostureAnalysis from "../hooks/usePostureAnalysis.jsx";
import useWebcam from "../hooks/useWebcam.jsx";
// API 클라이언트 import
import { apiHelpers } from "../api/apiClient.js";
// MediaPipe 라이브러리들을 동적 임포트로 변경
// import { Pose } from "@mediapipe/pose";
// import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import {
  DetectionContainer,
  VideoContainer,
  StyledWebcam,
  Canvas,
  ControlsContainer,
  StartButton,
  StopButton,
  StatusText,
  PostureInfo,
  ScoreContainer,
  ScoreCircle,
  ScoreInfo,
  ScoreLabel,
  ScoreValue,
  MetricsGrid,
  MetricCard,
  MetricLabel,
  MetricValue,
  IssuesList,
  IssueItem,
  NotificationBanner,
  NotificationCloseButton,
} from "../styles/PostureDetection.styles";
import { trackPostureAnalysis, trackError } from "../utils/analytics";

const PostureDetection = () => {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [postureStatus, setPostureStatus] = useState(
    t("detection.status.waiting")
  );
  const [postureData, setPostureData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const animationFrameRef = useRef(null);

  // 자세 데이터 저장 함수
  const handlePostureDataSave = useCallback(
    async (postureData) => {
      try {
        // 자세 측정 데이터 저장 (postureApi에서 자동으로 현재 사용자 ID 사용)
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
          sessionId: currentSessionId,
          timestamp: new Date().toISOString(),
        });

        console.log("자세 데이터 저장 완료:", savedData);
      } catch (error) {
        console.error("자세 데이터 저장 실패:", error);
      }
    },
    [currentSessionId]
  );

  // 커스텀 훅들 사용
  const { mediaPipeRef, poseRef, initializePose, cleanupPose, processFrame } =
    useMediaPipe();
  const { analyzePosture } = usePostureAnalysis();
  const { webcamRef, isStarted, startWebcam, stopWebcam } = useWebcam(
    undefined,
    () => console.log(t("webcam.startSuccess")),
    (error) => console.error(t("webcam.error"), error)
  );

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
  };

  const onPoseResults = useCallback(
    (results) => {
      if (!mediaPipeRef.current) return;

      const { drawConnectors, drawLandmarks } = mediaPipeRef.current;
      const { Pose } = mediaPipeRef.current;

      const canvasCtx = canvasRef.current.getContext("2d");
      canvasCtx.save();
      canvasCtx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      if (results.poseLandmarks) {
        drawConnectors(
          canvasCtx,
          results.poseLandmarks,
          Pose.POSE_CONNECTIONS,
          {
            color: "#00FF00",
            lineWidth: 2,
          }
        );
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: "#FF0000",
          lineWidth: 1,
          radius: 3,
        });

        // 자세 분석
        const analysisResult = analyzePosture(results.poseLandmarks);
        if (analysisResult) {
          setPostureStatus(analysisResult.status);
          setPostureData(analysisResult.postureData);

          // 자세 데이터 저장 (API 클라이언트 사용)
          handlePostureDataSave(analysisResult.postureData);
        }
      }

      canvasCtx.restore();
    },
    [mediaPipeRef, analyzePosture]
  );

  const startDetection = useCallback(async () => {
    try {
      // 브라우저 알림 권한 요청
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }

      // 새로운 세션 ID 생성 (String으로)
      const newSessionId = String(Date.now());
      setCurrentSessionId(newSessionId);

      await initializePose(onPoseResults);
      setIsDetecting(true);
      startWebcam();
      trackPostureAnalysis("detection_started", {
        timestamp: new Date().toISOString(),
        sessionId: newSessionId,
      });
    } catch (error) {
      console.error(t("detection.status.error"), error);
      setPostureStatus(t("detection.status.error"));
    }
  }, [initializePose, onPoseResults, startWebcam, t]);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    stopWebcam();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    trackPostureAnalysis("detection_stopped", {
      timestamp: new Date().toISOString(),
      sessionId: currentSessionId,
    });
    // 세션 ID 초기화
    setCurrentSessionId(null);
  }, [stopWebcam, currentSessionId]);

  const processFrameLoop = useCallback(async () => {
    if (webcamRef.current && poseRef.current && isDetecting) {
      const video = webcamRef.current.video;
      await processFrame(video);
      animationFrameRef.current = requestAnimationFrame(processFrameLoop);
    }
  }, [isDetecting, processFrame, webcamRef, poseRef]);

  useEffect(() => {
    if (isDetecting) {
      processFrameLoop();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDetecting, processFrameLoop]);

  useEffect(() => {
    return () => {
      cleanupPose();
    };
  }, [cleanupPose]);

  return (
    <DetectionContainer>
      {notification && (
        <NotificationBanner type={notification.type}>
          {notification.message}
          <NotificationCloseButton onClick={() => setNotification(null)}>
            ×
          </NotificationCloseButton>
        </NotificationBanner>
      )}

      <h1>{t("detection.title")}</h1>

      <ControlsContainer>
        {!isDetecting ? (
          <StartButton onClick={startDetection}>
            {t("detection.startButton")}
          </StartButton>
        ) : (
          <StopButton onClick={stopDetection}>
            {t("detection.stopButton")}
          </StopButton>
        )}
      </ControlsContainer>

      <VideoContainer>
        {isStarted && (
          <StyledWebcam
            ref={webcamRef}
            audio={false}
            videoConstraints={videoConstraints}
            mirrored={true}
            onUserMedia={() => console.log(t("webcam.startSuccess"))}
            onUserMediaError={(error) => {
              console.error(t("webcam.error"), error);
              setIsDetecting(false);
              trackError(error, { context: "webcam_error" });
            }}
          />
        )}
        <Canvas ref={canvasRef} width={640} height={480} />
      </VideoContainer>

      <StatusText
        isGood={
          postureStatus === t("detection.posture.perfect") ||
          postureStatus === t("detection.posture.good")
        }
      >
        {isDetecting
          ? `${t("detection.status.detecting")}: ${postureStatus}`
          : t("detection.status.ready")}
      </StatusText>

      {postureData && (
        <PostureInfo>
          <h3>{t("detection.feedback.analysis")}</h3>

          <ScoreContainer>
            <ScoreCircle score={postureData.score}>
              {postureData.score}%
            </ScoreCircle>
            <ScoreInfo>
              <ScoreLabel>{t("detection.metrics.score")}</ScoreLabel>
              <ScoreValue>{postureData.score}점</ScoreValue>
            </ScoreInfo>
          </ScoreContainer>

          <h4>{t("detection.feedback.title")}</h4>
          <IssuesList>
            {postureData.issues.map((issue, index) => (
              <IssueItem
                key={index}
                isGood={
                  issue.problem.includes(t("detection.posture.perfect")) ||
                  issue.problem.includes(t("detection.posture.good")) ||
                  issue.problem.includes(t("detection.posture.normal"))
                }
              >
                <div>
                  <strong>{issue.problem}</strong>
                  <p>{issue.solution}</p>
                </div>
              </IssueItem>
            ))}
          </IssuesList>

          <MetricsGrid>
            <MetricCard
              isGood={Math.abs(parseFloat(postureData.neckAngle)) <= 20}
            >
              <MetricLabel>{t("detection.metrics.neckAngle")}</MetricLabel>
              <MetricValue>{postureData.neckAngle}°</MetricValue>
            </MetricCard>

            <MetricCard
              isGood={Math.abs(parseFloat(postureData.shoulderSlope)) <= 10}
            >
              <MetricLabel>{t("detection.metrics.shoulderSlope")}</MetricLabel>
              <MetricValue>{postureData.shoulderSlope}°</MetricValue>
            </MetricCard>

            <MetricCard isGood={parseFloat(postureData.headForward) <= 10}>
              <MetricLabel>{t("detection.metrics.headForward")}</MetricLabel>
              <MetricValue>{postureData.headForward}%</MetricValue>
            </MetricCard>

            <MetricCard
              isGood={parseFloat(postureData.shoulderHeightDiff) <= 5}
            >
              <MetricLabel>
                {t("detection.metrics.shoulderHeightDiff")}
              </MetricLabel>
              <MetricValue>{postureData.shoulderHeightDiff}%</MetricValue>
            </MetricCard>
          </MetricsGrid>
        </PostureInfo>
      )}
    </DetectionContainer>
  );
};

export default PostureDetection;
