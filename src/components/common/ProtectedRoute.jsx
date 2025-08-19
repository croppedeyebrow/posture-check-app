import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authApi } from "../../api/authApi";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // 인증 상태 확인
  const authStatus = authApi.checkAuthStatus();

  // 로그인되지 않은 경우 로그인 페이지로 리다이렉션
  // 현재 경로를 state로 전달하여 로그인 후 원래 페이지로 돌아갈 수 있도록 함
  if (!authStatus.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 로그인된 경우 자식 컴포넌트 렌더링
  return children;
};

export default ProtectedRoute;
