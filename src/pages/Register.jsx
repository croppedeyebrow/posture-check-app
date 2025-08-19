import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { authApi } from "../api/authApi";
import LanguageSelector from "../components/common/LanguageSelector";

const RegisterContainer = styled.div`
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

const RegisterCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
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

  &.error {
    border-color: #e74c3c;
  }

  &.success {
    border-color: #27ae60;
  }
`;

const PasswordStrength = styled.div`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: ${({ strength }) => {
    if (strength === "weak") return "#e74c3c";
    if (strength === "medium") return "#f39c12";
    if (strength === "strong") return "#27ae60";
    return "#666";
  }};
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

const LoginLink = styled.div`
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

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // 리다이렉션 정보 가져오기
  const from = location.state?.from?.pathname || "/";

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  // 이미 로그인된 경우 홈페이지로 리다이렉션
  useEffect(() => {
    const authStatus = authApi.checkAuthStatus();
    if (authStatus.isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  const checkPasswordStrength = (password) => {
    if (password.length === 0) return "";
    if (password.length < 6) return "weak";
    if (password.length < 8) return "medium";
    if (
      password.length >= 8 &&
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
    ) {
      return "strong";
    }
    return "medium";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // 비밀번호 강도 체크
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }

    // 입력 시 에러 메시지 초기화
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("사용자명을 입력해주세요.");
      return false;
    }
    if (!formData.email.trim()) {
      setError("이메일을 입력해주세요.");
      return false;
    }
    if (!formData.password) {
      setError("비밀번호를 입력해주세요.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      console.log("회원가입 성공:", response);
      setSuccess("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");

      // 잠시 후 로그인 페이지로 리다이렉션
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("회원가입 실패:", error);
      setError(error.message || "회원가입에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <LanguageSelectorWrapper>
        <LanguageSelector />
      </LanguageSelectorWrapper>
      <RegisterCard>
        <BackToHome to="/">홈으로 돌아가기</BackToHome>

        <Logo>🧘</Logo>
        <Title>{t("auth.register")}</Title>
        <Subtitle>
          AI 자세교정 서비스에 가입하고 건강한 자세를 만들어보세요
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="username">{t("auth.username")}</Label>
            <Input
              type="text"
              id="username"
              name="username"
              placeholder="사용자명을 입력하세요"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </InputGroup>

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
              placeholder="비밀번호를 입력하세요 (최소 6자)"
              value={formData.password}
              onChange={handleInputChange}
              className={
                passwordStrength
                  ? passwordStrength === "weak"
                    ? "error"
                    : passwordStrength === "strong"
                    ? "success"
                    : ""
                  : ""
              }
              required
            />
            {passwordStrength && (
              <PasswordStrength strength={passwordStrength}>
                비밀번호 강도:{" "}
                {passwordStrength === "weak"
                  ? "약함"
                  : passwordStrength === "medium"
                  ? "보통"
                  : passwordStrength === "strong"
                  ? "강함"
                  : ""}
              </PasswordStrength>
            )}
          </InputGroup>

          <InputGroup>
            <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={
                formData.confirmPassword
                  ? formData.password === formData.confirmPassword
                    ? "success"
                    : "error"
                  : ""
              }
              required
            />
          </InputGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? t("auth.registering") : t("auth.register")}
          </SubmitButton>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
        </Form>

        <Divider>
          <span>또는</span>
        </Divider>

        <LoginLink>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </LoginLink>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;
