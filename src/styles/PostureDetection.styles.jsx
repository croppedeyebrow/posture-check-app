import styled from "styled-components";
import Webcam from "react-webcam";

export const DetectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

export const VideoContainer = styled.div`
  position: relative;
  width: 640px;
  height: 480px;
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const StyledWebcam = styled(Webcam)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

export const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
`;

export const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

export const StartButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

export const StopButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.error};
  color: white;

  &:hover {
    background-color: #d32f2f;
  }
`;

export const StatusText = styled.p`
  font-size: 1.2rem;
  color: ${({ theme, isGood }) =>
    isGood ? theme.colors.success : theme.colors.error};
  margin: 1rem 0;
`;

export const PostureInfo = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  min-width: 300px;
`;
