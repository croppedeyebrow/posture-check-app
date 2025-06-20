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
} from "../styles/PostureDetection.styles";

const PostureDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [postureStatus, setPostureStatus] = useState("감지 대기 중");
  const [postureData, setPostureData] = useState(null);
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

      // 어깨 각도 계산 (좌우 어깨)
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];

      // 목 각도 계산 (코와 어깨 중점)
      const nose = landmarks[0];
      const shoulderMidpoint = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2,
      };

      // 목 각도 계산
      const neckAngle =
        Math.atan2(nose.y - shoulderMidpoint.y, nose.x - shoulderMidpoint.x) *
        (180 / Math.PI);

      // 어깨 기울기 계산
      const shoulderSlope =
        Math.atan2(
          rightShoulder.y - leftShoulder.y,
          rightShoulder.x - leftShoulder.x
        ) *
        (180 / Math.PI);

      // 자세 상태 판단
      let status = "좋음";
      let issues = [];

      if (Math.abs(neckAngle) > 15) {
        issues.push("목이 기울어져 있습니다");
        status = "주의";
      }

      if (Math.abs(shoulderSlope) > 10) {
        issues.push("어깨가 기울어져 있습니다");
        status = "주의";
      }

      if (issues.length === 0) {
        status = "좋음";
        issues.push("올바른 자세입니다!");
      }

      setPostureStatus(status);
      setPostureData({
        neckAngle: neckAngle.toFixed(1),
        shoulderSlope: shoulderSlope.toFixed(1),
        issues,
      });

      // 전역 상태 업데이트
      setPosture({
        status,
        neckAngle,
        shoulderSlope,
        timestamp: Date.now(),
      });
    },
    [setPosture]
  );

  const startDetection = useCallback(async () => {
    try {
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
          <p>목 각도: {postureData.neckAngle}°</p>
          <p>어깨 기울기: {postureData.shoulderSlope}°</p>
          <ul>
            {postureData.issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </PostureInfo>
      )}
    </DetectionContainer>
  );
};

export default PostureDetection;
