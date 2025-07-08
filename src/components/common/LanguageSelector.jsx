import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

const FloatingButton = styled.button`
  position: fixed;
  right: 32px;
  bottom: 32px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  font-size: 0.2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: none;
  cursor: pointer;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  line-height: 1;
  &:hover {
    background: #0056b3;
  }
`;

const CenteredSpan = styled.span`
  display: inline-block;
  line-height: 1;
  font-size: 2rem;
`;

const LanguagePopup = styled.div`
  position: absolute;
  bottom: 70px;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  padding: 8px 0;
  z-index: 2100;
`;

const LanguageButton = styled.button`
  background: ${(props) => (props.isActive ? "#007bff" : "#f8f9fa")};
  color: ${(props) => (props.isActive ? "white" : "#333")};
  border: none;
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  border-bottom: ${(props) => (props.isLast ? "none" : "1px solid #eee")};
  &:hover {
    background: #e9ecef;
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
    <div style={{ position: "fixed", right: 32, bottom: 32, zIndex: 2000 }}>
      <FloatingButton
        onClick={() => setIsOpen((v) => !v)}
        aria-label={t("common.language") + " 선택"}
      >
        <CenteredSpan>{currentLanguage.flag}</CenteredSpan>
      </FloatingButton>
      {isOpen && (
        <LanguagePopup>
          {languages.map((language, idx) => (
            <LanguageButton
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              isActive={i18n.language === language.code}
              isLast={idx === languages.length - 1}
            >
              {language.flag} {language.name}
            </LanguageButton>
          ))}
        </LanguagePopup>
      )}
    </div>
  );
};

export default LanguageSelector;
