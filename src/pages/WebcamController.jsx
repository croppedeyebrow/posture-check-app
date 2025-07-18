import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
    console.log(t("webcam.startSuccess"));
  }, [t]);

  const handleUserMediaError = useCallback(
    (error) => {
      console.error(t("webcam.error"), error);
      setIsStarted(false);
      onStatusChange?.(false);
    },
    [onStatusChange, t]
  );

  return (
    <WebcamContainer>
      <StatusText isActive={isStarted}>
        {isStarted ? t("webcam.activated") : t("webcam.deactivated")}
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
          <StartButton onClick={startWebcam}>{t("webcam.start")}</StartButton>
        ) : (
          <>
            <StopButton onClick={stopWebcam}>{t("webcam.stop")}</StopButton>
            <CaptureButton onClick={capture}>
              {t("webcam.capture")}
            </CaptureButton>
          </>
        )}
      </ControlsContainer>

      {capturedImage && (
        <div>
          <h3>{t("webcam.capturedImage")}</h3>
          <img
            src={capturedImage}
            alt={t("webcam.capturedImage")}
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
