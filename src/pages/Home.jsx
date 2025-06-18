import React from "react";
import styled from "styled-components";

const HomeContainer = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
`;

const Home = () => {
  return (
    <HomeContainer>
      <Title>자세교정 앱에 오신 것을 환영합니다</Title>
      <p>시작하기 전에 웹캠 접근 권한을 허용해주세요.</p>
    </HomeContainer>
  );
};

export default Home;
