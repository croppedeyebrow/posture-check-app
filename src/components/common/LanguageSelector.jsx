import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

const LanguageContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
`;

const LanguageButton = styled.button`
  background: ${(props) => (props.isActive ? "#007bff" : "#f8f9fa")};
  color: ${(props) => (props.isActive ? "white" : "#333")};
  border: 2px solid #007bff;
  border-radius: 8px;
  padding: 8px 16px;
  margin: 0 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => (props.isActive ? "#0056b3" : "#e9ecef")};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
    margin: 0 2px;
  }
`;

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "ko", name: t("common.korean"), flag: "🇰🇷" },
    { code: "en", name: t("common.english"), flag: "🇺🇸" },
    { code: "ja", name: t("common.japanese"), flag: "🇯🇵" },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <LanguageContainer>
      <LanguageButton onClick={() => setIsOpen(!isOpen)} isActive={isOpen}>
        {currentLanguage.flag} {currentLanguage.name}
      </LanguageButton>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            marginTop: "8px",
            minWidth: "120px",
          }}
        >
          {languages.map((language) => (
            <LanguageButton
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              isActive={i18n.language === language.code}
              style={{
                display: "block",
                width: "100%",
                margin: "0",
                borderRadius: "0",
                border: "none",
                borderBottom:
                  language.code !== "ja" ? "1px solid #eee" : "none",
                textAlign: "left",
                padding: "12px 16px",
              }}
            >
              {language.flag} {language.name}
            </LanguageButton>
          ))}
        </div>
      )}
    </LanguageContainer>
  );
};

export default LanguageSelector;
