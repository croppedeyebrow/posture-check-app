import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { apiClient } from "../../api/apiClient.js";

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

const AuthButton = styled.button`
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

  &:hover {
    background: ${({ variant }) =>
      variant === "register" ? "white" : "rgba(255, 255, 255, 0.3)"};
    border-color: ${({ variant }) =>
      variant === "register" ? "white" : "rgba(255, 255, 255, 0.5)"};
    transform: translateY(-2px);
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

const LoginModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  color: #333;
  text-align: center;
`;

const ModalTabs = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e1e5e9;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ $active }) => ($active ? "#667eea" : "#666")};
  cursor: pointer;
  border-bottom: 2px solid
    ${({ $active }) => ($active ? "#667eea" : "transparent")};
  transition: all 0.3s ease;

  &:hover {
    color: #667eea;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 0.5rem;
`;

const Header = () => {
  const { t } = useTranslation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState("login"); // 'login' or 'register'
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 인증 상태 확인
  const authStatus = apiClient.auth.checkAuthStatus();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient.auth.login(loginData);
      console.log("로그인 성공:", response.user);
      setShowAuthModal(false);
      setLoginData({ email: "", password: "" });
      setError("");

      // 로그인 성공 후 홈페이지로 리다이렉션
      window.location.href = "/";
    } catch (error) {
      console.error("로그인 실패:", error);
      setError(error.message || "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 비밀번호 확인
    if (registerData.password !== registerData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.auth.register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
      });
      console.log("회원가입 성공:", response.user);
      setShowAuthModal(false);
      setRegisterData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setError("");

      // 회원가입 성공 후 로그인 탭으로 전환하고 메시지 표시
      setActiveTab("login");
      setError("회원가입이 완료되었습니다. 로그인해주세요.");
    } catch (error) {
      console.error("회원가입 실패:", error);
      setError(error.message || "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.auth.logout();
      console.log("로그아웃 완료");
      // 로그아웃 후 홈페이지로 리다이렉션
      window.location.href = "/";
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const handleInputChange = (e) => {
    if (activeTab === "login") {
      setLoginData({
        ...loginData,
        [e.target.name]: e.target.value,
      });
    } else {
      setRegisterData({
        ...registerData,
        [e.target.name]: e.target.value,
      });
    }
  };

  return (
    <>
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
              <AuthButton
                onClick={() => {
                  setActiveTab("login");
                  setShowAuthModal(true);
                }}
              >
                {t("auth.login")}
              </AuthButton>
              <AuthButton
                variant="register"
                onClick={() => {
                  setActiveTab("register");
                  setShowAuthModal(true);
                }}
              >
                {t("auth.register")}
              </AuthButton>
            </>
          )}
        </AuthContainer>
      </HeaderContainer>

      {showAuthModal && (
        <LoginModal onClick={() => setShowAuthModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowAuthModal(false)}>×</CloseButton>

            <ModalTabs>
              <TabButton
                $active={activeTab === "login"}
                onClick={() => setActiveTab("login")}
              >
                {t("auth.login")}
              </TabButton>
              <TabButton
                $active={activeTab === "register"}
                onClick={() => setActiveTab("register")}
              >
                {t("auth.register")}
              </TabButton>
            </ModalTabs>

            {activeTab === "login" ? (
              <Form onSubmit={handleLogin}>
                <Input
                  type="email"
                  name="email"
                  placeholder={t("auth.email")}
                  value={loginData.email}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  type="password"
                  name="password"
                  placeholder={t("auth.password")}
                  value={loginData.password}
                  onChange={handleInputChange}
                  required
                />
                <SubmitButton type="submit" disabled={isLoading}>
                  {isLoading ? t("auth.loggingIn") : t("auth.login")}
                </SubmitButton>
                {error && <ErrorMessage>{error}</ErrorMessage>}
              </Form>
            ) : (
              <Form onSubmit={handleRegister}>
                <Input
                  type="text"
                  name="username"
                  placeholder={t("auth.username")}
                  value={registerData.username}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  type="email"
                  name="email"
                  placeholder={t("auth.email")}
                  value={registerData.email}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  type="password"
                  name="password"
                  placeholder={t("auth.password")}
                  value={registerData.password}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder={t("auth.confirmPassword")}
                  value={registerData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <SubmitButton type="submit" disabled={isLoading}>
                  {isLoading ? t("auth.registering") : t("auth.register")}
                </SubmitButton>
                {error && <ErrorMessage>{error}</ErrorMessage>}
              </Form>
            )}
          </ModalContent>
        </LoginModal>
      )}
    </>
  );
};

export default Header;
