import styled from "styled-components";
import { Link } from "react-router-dom";

export const HomeContainer = styled.div`
  padding: 2rem;
  padding-top: 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
`;

export const Title = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
  text-align: center;
`;

export const Description = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2rem;
  text-align: center;
  max-width: 600px;
  line-height: 1.6;
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
`;

export const StyledLink = styled(Link)`
  padding: 1rem 2rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-2px);
  }
`;

export const Section = styled.div`
  margin: 2rem 0;
  text-align: center;
`;
