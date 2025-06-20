import React from "react";
import WebcamController from "./WebcamController";
import {
  HomeContainer,
  Title,
  Description,
  ButtonContainer,
  StyledLink,
  Section,
} from "../styles/Home.styles";

const Home = () => {
  return (
    <HomeContainer>
      <Title>자세교정 앱에 오신 것을 환영합니다</Title>
      <Description>
        웹캠을 통해 실시간으로 자세를 분석하고 교정할 수 있습니다. 시작하기 전에
        웹캠 접근 권한을 허용해주세요.
      </Description>

      <Section>
        <h2>웹캠 테스트</h2>
        <p>
          자세 감지를 시작하기 전에 웹캠이 정상적으로 작동하는지 확인해보세요.
        </p>
        <WebcamController />
      </Section>

      <ButtonContainer>
        <StyledLink to="/detection">자세 감지 시작하기</StyledLink>
      </ButtonContainer>
    </HomeContainer>
  );
};

export default Home;
