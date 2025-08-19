import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { authApi } from "../../api/authApi";

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  font-size: 1.2rem;
  color: #667eea;
`;

const LogoText = styled.span`
  font-family: "Noto Sans KR", sans-serif;
`;

const AuthContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AuthButton = styled(Link)`
  background: ${({ variant }) =>
    variant === "register"
      ? "rgba(255, 255, 255, 0.9)"
      : "rgba(255, 255, 255, 0.2)"};
  border: 2px solid
    ${({ variant }) =>
      variant === "register"
        ? "rgba(255, 255, 255, 0.9)"
        : "rgba(255, 255, 255, 0.3)"};
  color: ${({ variant }) => (variant === "register" ? "#667eea" : "white")};
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  text-decoration: none;
  display: inline-block;

  &:hover {
    background: ${({ variant }) =>
      variant === "register" ? "white" : "rgba(255, 255, 255, 0.3)"};
    border-color: ${({ variant }) =>
      variant === "register" ? "white" : "rgba(255, 255, 255, 0.5)"};
    transform: translateY(-2px);
    text-decoration: none;
    color: ${({ variant }) => (variant === "register" ? "#667eea" : "white")};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Header = () => {
  const { t } = useTranslation();

  // 인증 상태 확인
  const authStatus = authApi.checkAuthStatus();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      console.log("로그아웃 완료");
      // 로그아웃 후 홈페이지로 리다이렉션
      window.location.href = "/";
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <HeaderContainer>
      <LogoContainer to="/">
        <LogoIcon>🧘</LogoIcon>
        <LogoText>{t("app.name")}</LogoText>
      </LogoContainer>

      <AuthContainer>
        {authStatus.isAuthenticated ? (
          <UserInfo>
            <UserAvatar>
              {authStatus.user?.username?.charAt(0) || "U"}
            </UserAvatar>
            <span>{authStatus.user?.username || "사용자"}</span>
            <LogoutButton onClick={handleLogout}>
              {t("auth.logout")}
            </LogoutButton>
          </UserInfo>
        ) : (
          <>
            <AuthButton to="/login">{t("auth.login")}</AuthButton>
            <AuthButton to="/register" variant="register">
              {t("auth.register")}
            </AuthButton>
          </>
        )}
      </AuthContainer>
    </HeaderContainer>
  );
};

export default Header;
