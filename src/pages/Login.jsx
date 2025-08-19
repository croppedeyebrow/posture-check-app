import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { authApi } from "../api/authApi";
import LanguageSelector from "../components/common/LanguageSelector";

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  position: relative;
`;

const LanguageSelectorWrapper = styled.div`
  position: absolute;
  top: 2rem;
  right: 2rem;
  z-index: 10;
`;

const LoginCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
`;

const Title = styled.h1`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.8rem;
  font-weight: 600;
`;

const Subtitle = styled.p`
  margin: 0 0 2rem 0;
  color: #666;
  font-size: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 5px;
`;

const SuccessMessage = styled.div`
  color: #27ae60;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 5px;
`;

const Divider = styled.div`
  margin: 2rem 0;
  text-align: center;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e1e5e9;
  }

  span {
    background: white;
    padding: 0 1rem;
    color: #666;
    font-size: 0.9rem;
  }
`;

const RegisterLink = styled.div`
  margin-top: 1.5rem;
  color: #666;
  font-size: 0.9rem;

  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const BackToHome = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 2rem;
  transition: color 0.3s ease;

  &:hover {
    color: #764ba2;
  }

  &::before {
    content: "←";
    margin-right: 0.5rem;
    font-size: 1.2rem;
  }
`;

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // 리다이렉션 정보 가져오기
  const from = location.state?.from?.pathname || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 이미 로그인된 경우 홈페이지로 리다이렉션
  useEffect(() => {
    const authStatus = authApi.checkAuthStatus();
    if (authStatus.isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // 입력 시 에러 메시지 초기화
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authApi.login(formData);
      console.log("로그인 성공:", response.user);
      setSuccess("로그인에 성공했습니다!");

      // 잠시 후 원래 접근하려던 페이지로 리다이렉션
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (error) {
      console.error("로그인 실패:", error);
      setError(
        error.message ||
          "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LanguageSelectorWrapper>
        <LanguageSelector />
      </LanguageSelectorWrapper>
      <LoginCard>
        <BackToHome to="/">홈으로 돌아가기</BackToHome>

        <Logo>🧘</Logo>
        <Title>{t("auth.login")}</Title>
        <Subtitle>
          {from !== "/"
            ? `로그인이 필요한 페이지입니다. 로그인 후 ${
                from === "/detection"
                  ? "자세 감지"
                  : from === "/data"
                  ? "데이터"
                  : "해당"
              } 페이지로 이동합니다.`
            : "AI 자세교정 서비스를 이용하려면 로그인해주세요"}
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </InputGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? t("auth.loggingIn") : t("auth.login")}
          </SubmitButton>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
        </Form>

        <Divider>
          <span>또는</span>
        </Divider>

        <RegisterLink>
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </RegisterLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
