import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import {
  WebcamContainer,
  WebcamWrapper,
  StyledWebcam,
  ControlsContainer,
  StartButton,
  StopButton,
  CaptureButton,
  StatusText,
} from "../styles/WebcamController.styles";

const WebcamController = ({ onStatusChange }) => {
  const webcamRef = useRef(null);
  const [isStarted, setIsStarted] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
  };

  const startWebcam = useCallback(() => {
    setIsStarted(true);
    onStatusChange?.(true);
  }, [onStatusChange]);

  const stopWebcam = useCallback(() => {
    setIsStarted(false);
    onStatusChange?.(false);
  }, [onStatusChange]);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    }
  }, []);

  const handleUserMedia = useCallback(() => {
    console.log("웹캠이 성공적으로 시작되었습니다.");
  }, []);

  const handleUserMediaError = useCallback(
    (error) => {
      console.error("웹캠 오류:", error);
      setIsStarted(false);
      onStatusChange?.(false);
    },
    [onStatusChange]
  );

  return (
    <WebcamContainer>
      <StatusText isActive={isStarted}>
        {isStarted ? "웹캠 활성화됨" : "웹캠 비활성화됨"}
      </StatusText>

      <WebcamWrapper>
        {isStarted && (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            mirrored={true}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
      </WebcamWrapper>

      <ControlsContainer>
        {!isStarted ? (
          <StartButton onClick={startWebcam}>웹캠 시작</StartButton>
        ) : (
          <>
            <StopButton onClick={stopWebcam}>웹캠 중지</StopButton>
            <CaptureButton onClick={capture}>사진 촬영</CaptureButton>
          </>
        )}
      </ControlsContainer>

      {capturedImage && (
        <div>
          <h3>촬영된 사진</h3>
          <img
            src={capturedImage}
            alt="촬영된 사진"
            style={{
              maxWidth: "320px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          />
        </div>
      )}
    </WebcamContainer>
  );
};

export default WebcamController;
