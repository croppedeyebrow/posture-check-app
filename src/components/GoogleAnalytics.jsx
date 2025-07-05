import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initGA, trackPageView } from "../utils/analytics";

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // GA4 초기화 (앱 시작 시 한 번만)
    initGA();
  }, []);

  useEffect(() => {
    // 페이지 변경 시 페이지뷰 추적
    if (location.pathname) {
      trackPageView(location.pathname);
    }
  }, [location.pathname]);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
};

export default GoogleAnalytics;
