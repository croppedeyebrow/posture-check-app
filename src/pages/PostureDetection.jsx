import React, { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
// 커스텀 훅들 import
import useMediaPipe from "../hooks/useMediaPipe.jsx";
import usePostureAnalysis from "../hooks/usePostureAnalysis.jsx";
import useWebcam from "../hooks/useWebcam.jsx";
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
  const canvasRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [postureStatus, setPostureStatus] = useState("감지 대기 중");
  const [postureData, setPostureData] = useState(null);
  const [notification, setNotification] = useState(null);

  const animationFrameRef = useRef(null);

  // 커스텀 훅들 사용
  const { mediaPipeRef, poseRef, initializePose, cleanupPose, processFrame } =
    useMediaPipe();
  const { analyzePosture } = usePostureAnalysis();
  const { webcamRef, isStarted, startWebcam, stopWebcam } = useWebcam();

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

      await initializePose(onPoseResults);
      setIsDetecting(true);
      startWebcam();
      trackPostureAnalysis("detection_started", {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("자세 감지 시작 오류:", error);
      setPostureStatus("초기화 오류");
    }
  }, [initializePose, onPoseResults, startWebcam]);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    stopWebcam();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    trackPostureAnalysis("detection_stopped", {
      timestamp: new Date().toISOString(),
    });
  }, [stopWebcam]);

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

      <h1>자세 감지</h1>

      <ControlsContainer>
        {!isDetecting ? (
          <StartButton onClick={startDetection}>자세 감지 시작</StartButton>
        ) : (
          <StopButton onClick={stopDetection}>자세 감지 중지</StopButton>
        )}
      </ControlsContainer>

      <VideoContainer>
        {isStarted && (
          <StyledWebcam
            ref={webcamRef}
            audio={false}
            videoConstraints={videoConstraints}
            mirrored={true}
            onUserMedia={() => console.log("웹캠 시작됨")}
            onUserMediaError={(error) => {
              console.error("웹캠 오류:", error);
              setIsDetecting(false);
              trackError(error, { context: "webcam_error" });
            }}
          />
        )}
        <Canvas ref={canvasRef} width={640} height={480} />
      </VideoContainer>

      <StatusText
        isGood={
          postureStatus === "완벽한 자세" || postureStatus === "좋은 자세"
        }
      >
        {isDetecting ? `자세 상태: ${postureStatus}` : "자세 감지 준비 중..."}
      </StatusText>

      {postureData && (
        <PostureInfo>
          <h3>자세 분석 결과</h3>

          <ScoreContainer>
            <ScoreCircle score={postureData.score}>
              {postureData.score}%
            </ScoreCircle>
            <ScoreInfo>
              <ScoreLabel>자세 점수</ScoreLabel>
              <ScoreValue>{postureData.score}점</ScoreValue>
            </ScoreInfo>
          </ScoreContainer>

          <h4>자세 피드백</h4>
          <IssuesList>
            {postureData.issues.map((issue, index) => (
              <IssueItem
                key={index}
                isGood={
                  issue.problem.includes("완벽한") ||
                  issue.problem.includes("좋은") ||
                  issue.problem.includes("괜찮은")
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
              <MetricLabel>목 각도</MetricLabel>
              <MetricValue>{postureData.neckAngle}°</MetricValue>
            </MetricCard>

            <MetricCard
              isGood={Math.abs(parseFloat(postureData.shoulderSlope)) <= 10}
            >
              <MetricLabel>어깨 기울기</MetricLabel>
              <MetricValue>{postureData.shoulderSlope}°</MetricValue>
            </MetricCard>

            <MetricCard isGood={parseFloat(postureData.headForward) <= 10}>
              <MetricLabel>머리 전방 돌출도</MetricLabel>
              <MetricValue>{postureData.headForward}%</MetricValue>
            </MetricCard>

            <MetricCard
              isGood={parseFloat(postureData.shoulderHeightDiff) <= 5}
            >
              <MetricLabel>어깨 높이 차이</MetricLabel>
              <MetricValue>{postureData.shoulderHeightDiff}%</MetricValue>
            </MetricCard>
          </MetricsGrid>
        </PostureInfo>
      )}
    </DetectionContainer>
  );
};

export default PostureDetection;
