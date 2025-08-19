import React, { useState } from "react";
import styled from "styled-components";
import { checkApiConnection, logEnvironmentInfo } from "../../api/index.js";

const StatusContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-family: "Noto Sans KR", sans-serif;
  font-size: 12px;
  z-index: 9999;
  max-width: 300px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatusItem = styled.div`
  margin: 5px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.status === "success"
      ? "#4CAF50"
      : props.status === "error"
      ? "#f44336"
      : "#ff9800"};
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  margin: 2px;

  &:hover {
    background: #0056b3;
  }
`;

const ApiStatusChecker = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckConnection = async () => {
    setIsLoading(true);
    try {
      const results = await checkApiConnection();
      setConnectionStatus(results);
    } catch (error) {
      console.error("API 연결 확인 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogEnvironment = () => {
    logEnvironmentInfo();
  };

  // 개발 환경에서만 표시
  if (import.meta.env.PROD && !import.meta.env.DEV) {
    return null;
  }

  return (
    <>
      {/* 토글 버튼 */}
      <div
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          zIndex: 10000,
          cursor: "pointer",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "5px 10px",
          borderRadius: "4px",
          fontSize: "12px",
          fontFamily: "monospace",
        }}
        onClick={() => setIsVisible(!isVisible)}
      >
        🔧 API
      </div>

      {/* 상태 패널 */}
      {isVisible && (
        <StatusContainer>
          <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
            🔧 API 연결 상태
          </div>

          <div style={{ marginBottom: "10px" }}>
            <Button onClick={handleCheckConnection} disabled={isLoading}>
              {isLoading ? "확인 중..." : "연결 확인"}
            </Button>
            <Button onClick={handleLogEnvironment}>환경 정보</Button>
          </div>

          {connectionStatus && (
            <div>
              {connectionStatus.map((result, index) => (
                <StatusItem key={index}>
                  <StatusIndicator
                    status={
                      result.status.includes("성공") ? "success" : "error"
                    }
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold" }}>
                      {result.server}
                    </div>
                    <div style={{ fontSize: "10px", opacity: 0.8 }}>
                      {result.status}{" "}
                      {result.responseTime && `(${result.responseTime})`}
                    </div>
                  </div>
                </StatusItem>
              ))}
            </div>
          )}

          <div style={{ marginTop: "10px", fontSize: "10px", opacity: 0.7 }}>
            💡 개발자 도구에서 <code>apiTest.checkConnection()</code> 실행 가능
          </div>
        </StatusContainer>
      )}
    </>
  );
};

export default ApiStatusChecker;
