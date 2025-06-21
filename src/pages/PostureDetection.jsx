import React, { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import useStore from "../store/useStore";
import { Pose } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
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

const PostureDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [postureStatus, setPostureStatus] = useState("감지 대기 중");
  const [postureData, setPostureData] = useState(null);
  const [notification, setNotification] = useState(null);
  const { setPosture } = useStore();

  const poseRef = useRef(null);
  const animationFrameRef = useRef(null);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
  };

  const initializePose = useCallback(async () => {
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

    poseRef.current.onResults(onPoseResults);
  }, []);

  const onPoseResults = useCallback((results) => {
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
      drawConnectors(canvasCtx, results.poseLandmarks, Pose.POSE_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 2,
      });
      drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: "#FF0000",
        lineWidth: 1,
        radius: 3,
      });

      // 자세 분석
      analyzePosture(results.poseLandmarks);
    }

    canvasCtx.restore();
  }, []);

  const analyzePosture = useCallback(
    (landmarks) => {
      if (!landmarks) return;

      // 주요 랜드마크 추출
      const nose = landmarks[0];
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];

      // 어깨 중점 계산
      const shoulderMidpoint = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2,
      };

      // 1. 목 각도 계산 (코와 어깨 중점)
      const neckAngle =
        Math.atan2(nose.y - shoulderMidpoint.y, nose.x - shoulderMidpoint.x) *
        (180 / Math.PI);

      // 2. 어깨 기울기 계산
      const shoulderSlope =
        Math.atan2(
          rightShoulder.y - leftShoulder.y,
          rightShoulder.x - leftShoulder.x
        ) *
        (180 / Math.PI);

      // 3. 머리 전방 돌출도 계산 (코와 어깨 중점의 수직 거리)
      const headForward = Math.abs(nose.x - shoulderMidpoint.x);

      // 4. 어깨 높이 차이 계산
      const shoulderHeightDiff = Math.abs(leftShoulder.y - rightShoulder.y);

      // 자세 상태 판단
      let status = "좋음";
      let issues = [];
      let score = 100;

      // 목 각도 검사 (정상: -30° ~ 30°) - 더 관대한 기준
      if (Math.abs(neckAngle) > 30) {
        issues.push("목이 많이 기울어져 있습니다");
        status = "주의";
        score -= 15;
      } else if (Math.abs(neckAngle) > 20) {
        issues.push("목이 약간 기울어져 있습니다");
        score -= 10;
      }

      // 어깨 기울기 검사 (정상: -15° ~ 15°) - 더 관대한 기준
      if (Math.abs(shoulderSlope) > 15) {
        issues.push("어깨가 많이 기울어져 있습니다");
        status = "주의";
        score -= 12;
      } else if (Math.abs(shoulderSlope) > 10) {
        issues.push("어깨가 약간 기울어져 있습니다");
        score -= 8;
      }

      // 머리 전방 돌출 검사 (정상: ≤ 20%) - 더 관대한 기준
      if (headForward > 0.2) {
        issues.push("머리가 많이 앞으로 나와 있습니다");
        status = "주의";
        score -= 15;
      } else if (headForward > 0.15) {
        issues.push("머리가 약간 앞으로 나와 있습니다");
        score -= 10;
      }

      // 어깨 높이 차이 검사 (정상: ≤ 12%) - 더 관대한 기준
      if (shoulderHeightDiff > 0.12) {
        issues.push("어깨 높이가 많이 다릅니다");
        status = "주의";
        score -= 8;
      } else if (shoulderHeightDiff > 0.08) {
        issues.push("어깨 높이가 약간 다릅니다");
        score -= 5;
      }

      // 점수 보정 및 상태 결정
      score = Math.max(0, score);

      // 점수에 따른 최종 상태 결정
      if (score >= 80) {
        status = "좋음";
        if (issues.length === 0) {
          issues.push("완벽한 자세입니다! 👍");
        }
      } else if (score >= 65) {
        status = "보통";
        if (issues.length === 0) {
          issues.push("전반적으로 괜찮은 자세입니다");
        }
      } else {
        status = "주의";
        if (issues.length === 0) {
          issues.push("자세를 개선해보세요");
        }
      }

      // 알림 설정
      if (score < 50 && !notification) {
        setNotification({
          message: "자세가 많이 좋지 않습니다! 자세를 교정해주세요.",
          type: "warning",
        });

        // 브라우저 알림 (사용자가 허용한 경우)
        if (Notification.permission === "granted") {
          new Notification("자세 교정 알림", {
            body: "현재 자세가 많이 좋지 않습니다. 자세를 교정해주세요.",
            icon: "/vite.svg",
          });
        }
      } else if (score >= 65 && notification) {
        setNotification(null);
      }

      setPostureStatus(status);
      setPostureData({
        neckAngle: neckAngle.toFixed(1),
        shoulderSlope: shoulderSlope.toFixed(1),
        headForward: (headForward * 100).toFixed(1),
        shoulderHeightDiff: (shoulderHeightDiff * 100).toFixed(1),
        score: score,
        issues,
      });

      // 전역 상태 업데이트
      setPosture({
        status,
        neckAngle,
        shoulderSlope,
        headForward,
        shoulderHeightDiff,
        score,
        timestamp: Date.now(),
      });

      // 로컬 스토리지에 자세 데이터 저장
      const postureHistory = JSON.parse(
        localStorage.getItem("postureHistory") || "[]"
      );
      const newPostureRecord = {
        status,
        neckAngle,
        shoulderSlope,
        headForward,
        shoulderHeightDiff,
        score,
        timestamp: Date.now(),
      };

      postureHistory.push(newPostureRecord);

      // 최근 100개의 기록만 유지
      if (postureHistory.length > 100) {
        postureHistory.splice(0, postureHistory.length - 100);
      }

      localStorage.setItem("postureHistory", JSON.stringify(postureHistory));
    },
    [setPosture]
  );

  const startDetection = useCallback(async () => {
    try {
      // 브라우저 알림 권한 요청
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }

      await initializePose();
      setIsDetecting(true);
      setIsWebcamActive(true);
    } catch (error) {
      console.error("자세 감지 시작 오류:", error);
      setPostureStatus("초기화 오류");
    }
  }, [initializePose]);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    setIsWebcamActive(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const processFrame = useCallback(async () => {
    if (webcamRef.current && poseRef.current && isDetecting) {
      const video = webcamRef.current.video;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        await poseRef.current.send({ image: video });
      }
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [isDetecting]);

  useEffect(() => {
    if (isDetecting) {
      processFrame();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDetecting, processFrame]);

  useEffect(() => {
    return () => {
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, []);

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
        {isWebcamActive && (
          <StyledWebcam
            ref={webcamRef}
            audio={false}
            videoConstraints={videoConstraints}
            mirrored={true}
            onUserMedia={() => console.log("웹캠 시작됨")}
            onUserMediaError={(error) => {
              console.error("웹캠 오류:", error);
              setIsWebcamActive(false);
              setIsDetecting(false);
            }}
          />
        )}
        <Canvas ref={canvasRef} width={640} height={480} />
      </VideoContainer>

      <StatusText isGood={postureStatus === "좋음"}>
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

          <MetricsGrid>
            <MetricCard
              isGood={Math.abs(parseFloat(postureData.neckAngle)) <= 10}
            >
              <MetricLabel>목 각도</MetricLabel>
              <MetricValue>{postureData.neckAngle}°</MetricValue>
            </MetricCard>

            <MetricCard
              isGood={Math.abs(parseFloat(postureData.shoulderSlope)) <= 5}
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

          <h4>자세 피드백</h4>
          <IssuesList>
            {postureData.issues.map((issue, index) => (
              <IssueItem key={index} isGood={issue.includes("올바른")}>
                {issue}
              </IssueItem>
            ))}
          </IssuesList>
        </PostureInfo>
      )}
    </DetectionContainer>
  );
};

export default PostureDetection;
