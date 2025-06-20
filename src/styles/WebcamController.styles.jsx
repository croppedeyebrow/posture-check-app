import styled from "styled-components";

export const WebcamContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
`;

export const WebcamWrapper = styled.div`
  position: relative;
  width: 640px;
  height: 480px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const StyledWebcam = styled.div`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
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

export const CaptureButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.success};
  color: white;

  &:hover {
    background-color: #2e7d32;
  }
`;

export const StatusText = styled.p`
  font-size: 1.1rem;
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.success : theme.colors.text};
  margin: 0.5rem 0;
`;
