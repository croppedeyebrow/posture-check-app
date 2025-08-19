import { trackDataExport } from "../../utils/analytics";

// 점수에 따른 상태 반환
const getScoreStatus = (score, t) => {
  if (score >= 90)
    return { text: t("detection.posture.perfect"), color: "excellent" };
  if (score >= 60) return { text: t("detection.posture.good"), color: "good" };
  if (score >= 50)
    return { text: t("detection.posture.normal"), color: "average" };
  return { text: t("detection.posture.bad"), color: "poor" };
};

// 날짜 포맷팅
const formatDate = (timestamp, language = "ko") => {
  const localeMap = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
  };

  const locale = localeMap[language] || "ko-KR";

  return new Date(timestamp).toLocaleString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const exportCsv = (
  filteredHistory,
  startDate,
  endDate,
  t,
  language = "ko"
) => {
  // CSV 헤더 생성 (최신 지표 포함)
  const headers = [
    t("data.export.dateTime"),
    t("detection.metrics.score"),
    t("data.export.status"),
    t("detection.metrics.neckAngle"),
    t("detection.metrics.shoulderSlope"),
    t("detection.metrics.headForward"),
    t("detection.metrics.shoulderHeightDiff"),
    t("data.export.cervicalLordosis"),
    t("data.export.forwardHeadDistance"),
    t("data.export.headTilt"),
    t("data.export.headRotation"),
    t("data.export.shoulderHeightDiffMm"),
    t("data.export.scapularWingingLeft"),
    t("data.export.scapularWingingRight"),
    t("data.export.shoulderForwardMovement"),
    t("data.export.feedback"),
  ];

  // CSV 데이터 생성
  const csvData = filteredHistory
    .slice()
    .reverse()
    .map((record) => {
      const status = getScoreStatus(record.score, t);
      // issues가 배열인지 확인하고 안전하게 처리
      let feedback = "";
      if (record.issues) {
        if (Array.isArray(record.issues)) {
          feedback = record.issues.join("; ");
        } else if (typeof record.issues === "string") {
          feedback = record.issues;
        } else if (typeof record.issues === "object") {
          feedback = JSON.stringify(record.issues);
        }
      }

      return [
        formatDate(record.timestamp, language),
        record.score,
        status.text,
        record.neckAngle,
        record.shoulderSlope,
        record.headForward,
        record.shoulderHeightDiff,
        record.cervicalLordosis || 0,
        record.forwardHeadDistance || 0,
        record.headTilt || 0,
        record.headRotation || 0,
        record.leftShoulderHeightDiff || 0,
        record.leftScapularWinging ? "예" : "아니오",
        record.rightScapularWinging ? "예" : "아니오",
        record.shoulderForwardMovement || 0,
        feedback,
      ];
    });

  // CSV 문자열 생성
  const csvContent = [
    headers.join(","),
    ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  // BOM 추가 (한글 깨짐 방지)
  const BOM = "\uFEFF";
  const csvWithBOM = BOM + csvContent;

  // 파일 다운로드
  const dataBlob = new Blob([csvWithBOM], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${t("data.export.postureData")}_${
    new Date().toISOString().split("T")[0]
  }.csv`;
  link.click();
  URL.revokeObjectURL(url);

  trackDataExport("csv", {
    recordCount: filteredHistory.length,
    dateRange: `${startDate} ~ ${endDate}`,
  });
};
