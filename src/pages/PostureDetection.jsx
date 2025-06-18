import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import useStore from "../store/useStore";

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

const PostureDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const { setPosture } = useStore();

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("웹캠 접근 오류:", error);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <DetectionContainer>
      <h1>자세 감지</h1>
      <VideoContainer>
        <Video ref={videoRef} autoPlay playsInline />
        <Canvas ref={canvasRef} />
      </VideoContainer>
      <StatusText isGood={isDetecting}>
        {isDetecting ? "자세 감지 중..." : "자세 감지 준비 중..."}
      </StatusText>
    </DetectionContainer>
  );
};

export default PostureDetection;
