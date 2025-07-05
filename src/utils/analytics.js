import ReactGA from "react-ga4";

// GA4 초기화 (HTML에 직접 태그가 추가되어 있으므로 중복 방지)
export const initGA = () => {
  // HTML에 이미 GA4 태그가 추가되어 있으므로 초기화 완료로 간주
  console.log("GA4가 HTML에서 이미 로드되었습니다.");
};

// 페이지뷰 추적 (기존 gtag 함수 활용)
export const trackPageView = (path) => {
  if (window.gtag) {
    window.gtag("config", "G-93H8BB62GE", {
      page_path: path,
    });
  }
};

// 커스텀 이벤트 추적 (기존 gtag 함수 활용)
export const trackEvent = (category, action, label = null, value = null) => {
  if (window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// 자세 분석 관련 이벤트 추적
export const trackPostureAnalysis = (action, details = {}) => {
  trackEvent("posture_analysis", action, JSON.stringify(details));
};

// 웹캠 관련 이벤트 추적
export const trackWebcamEvent = (action, details = {}) => {
  trackEvent("webcam", action, JSON.stringify(details));
};

// 데이터 내보내기 이벤트 추적
export const trackDataExport = (format, details = {}) => {
  trackEvent("data_export", format, JSON.stringify(details));
};

// 에러 추적
export const trackError = (error, context = {}) => {
  trackEvent("error", error.message || error, JSON.stringify(context));
};
