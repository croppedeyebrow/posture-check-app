import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  return (
    <HomeContainer>
      <Title>{t("home.title")}</Title>
      <Description>{t("home.description")}</Description>

      <Section>
        <h2>{t("home.features.title")}</h2>
        <p>{t("home.features.realtime")}</p>
        <WebcamController />
      </Section>

      <ButtonContainer>
        <StyledLink to="/detection">{t("home.startButton")}</StyledLink>
        <StyledLink to="/data">{t("nav.data")}</StyledLink>
      </ButtonContainer>
    </HomeContainer>
  );
};

export default Home;
