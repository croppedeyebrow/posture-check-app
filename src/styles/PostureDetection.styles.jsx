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
  border-radius: 8px;
`;

export const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border-radius: 8px;
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

export const ScoreContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
`;

export const ScoreCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  background: ${({ score }) => {
    if (score >= 90) return "linear-gradient(135deg, #4CAF50, #45a049)";
    if (score >= 60) return "linear-gradient(135deg, #2196F3, #1976D2)";
    if (score >= 50) return "linear-gradient(135deg, #FF9800, #F57C00)";
    return "linear-gradient(135deg, #F44336, #D32F2F)";
  }};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

export const ScoreInfo = styled.div`
  flex: 1;
`;

export const ScoreLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
`;

export const ScoreValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

export const MetricCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid
    ${({ theme, isGood }) =>
      isGood ? theme.colors.success : theme.colors.error};
`;

export const MetricLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0.5rem;
`;

export const MetricValue = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

export const IssuesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
`;

export const IssueItem = styled.li`
  padding: 1rem;
  margin: 0.5rem 0;
  background: ${({ theme, isGood }) =>
    isGood ? theme.colors.success + "20" : theme.colors.error + "20"};
  border-radius: 8px;
  border-left: 4px solid
    ${({ theme, isGood }) =>
      isGood ? theme.colors.success : theme.colors.error};
  color: ${({ theme, isGood }) =>
    isGood ? theme.colors.success : theme.colors.error};

  strong {
    display: block;
    font-size: 1rem;
    margin-bottom: 0.5rem;
    color: ${({ theme, isGood }) =>
      isGood ? theme.colors.success : theme.colors.error};
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.4;
    color: ${({ theme }) => theme.colors.text};
    opacity: 0.9;
  }
`;

export const NotificationBanner = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  background: ${({ type }) =>
    type === "warning"
      ? "linear-gradient(135deg, #FF9800, #F57C00)"
      : type === "error"
      ? "linear-gradient(135deg, #F44336, #D32F2F)"
      : "linear-gradient(135deg, #4CAF50, #45a049)"};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

export const NotificationCloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: 1rem;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
`;
