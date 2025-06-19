import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import useStore from "../store/useStore";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

const DetectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 640px;
  height: 480px;
  margin-bottom: 1rem;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  background-color: #000;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const StatusText = styled.p`
  font-size: 1.2rem;
  color: ${({ theme, isGood }) =>
    isGood ? theme.colors.success : theme.colors.error};
  margin: 1rem 0;
`;

const PostureInfo = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  min-width: 300px;
`;

const PostureDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [postureStatus, setPostureStatus] = useState("감지 대기 중");
  const [postureData, setPostureData] = useState(null);
  const { setPosture } = useStore();

  const poseRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    const initializePose = async () => {
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
    };

    const onPoseResults = (results) => {
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
        analyzePosture(results.poseLandmarks);
      }

      canvasCtx.restore();
    };

    const analyzePosture = (landmarks) => {
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
    };

    const startCamera = async () => {
      try {
        await initializePose();

        cameraRef.current = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await poseRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });

        await cameraRef.current.start();
        setIsDetecting(true);
      } catch (error) {
        console.error("카메라 시작 오류:", error);
        setPostureStatus("카메라 오류");
      }
    };

    startCamera();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [setPosture]);

  return (
    <DetectionContainer>
      <h1>자세 감지</h1>
      <VideoContainer>
        <Video ref={videoRef} autoPlay playsInline />
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
