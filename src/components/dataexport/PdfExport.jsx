import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// PDF 내보내기 유틸 함수
export async function exportPDF({
  filteredHistory,
  stats,
  t,
  getScoreStatus,
  formatDate,
  language = "ko",
}) {
  // 기본 함수들 제공 (전달되지 않은 경우)
  const defaultGetScoreStatus = (score) => {
    if (score >= 90) return { text: "완벽", color: "excellent" };
    if (score >= 60) return { text: "좋음", color: "good" };
    if (score >= 50) return { text: "보통", color: "average" };
    return { text: "나쁨", color: "poor" };
  };

  const defaultFormatDate = (timestamp) => {
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

  // 함수가 전달되지 않은 경우 기본 함수 사용
  const safeGetScoreStatus = getScoreStatus || defaultGetScoreStatus;
  const safeFormatDate = formatDate || defaultFormatDate;
  // PDF 문서 생성 (가로 방향)
  const doc = new jsPDF("landscape", "mm", "a4");

  // 1. ttf 파일을 fetch로 읽어서 base64로 변환 (btoa 대신 arrayBufferToBase64 사용)
  function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  const response = await fetch("/fonts/NotoSansKR-Regular.ttf");
  const fontBuffer = await response.arrayBuffer();
  const fontBase64 = arrayBufferToBase64(fontBuffer);

  // 2. jsPDF에 폰트 등록
  doc.addFileToVFS("NotoSansKR-Regular.ttf", fontBase64);
  doc.addFont("NotoSansKR-Regular.ttf", "NotoSansKR", "normal");
  doc.setFont("NotoSansKR", "normal");

  // 제목 추가
  doc.setFontSize(20);
  doc.text(t("data.export.postureAnalysisReport"), 140, 20, {
    align: "center",
  });

  // 생성일 추가
  doc.setFontSize(12);
  const localeMap = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
  };
  const locale = localeMap[language] || "ko-KR";

  doc.text(
    `${t("data.export.generatedDate")}: ${new Date().toLocaleString(locale)}`,
    20,
    35
  );
  doc.text(
    `${t("data.stats.totalRecords")}: ${filteredHistory.length}${t(
      "data.export.records"
    )}`,
    20,
    45
  );

  // 통계 정보 추가
  doc.setFontSize(14);
  doc.text(t("data.stats.title"), 20, 60);
  doc.setFontSize(10);
  doc.text(
    `${t("data.stats.averageScore")}: ${stats?.avgScore || 0}${t(
      "data.export.points"
    )}`,
    20,
    70
  );
  doc.text(
    `${t("data.stats.bestScore")}: ${stats?.maxScore || 0}${t(
      "data.export.points"
    )}`,
    20,
    80
  );
  doc.text(
    `${t("data.export.minScore")}: ${stats?.minScore || 0}${t(
      "data.export.points"
    )}`,
    20,
    90
  );
  doc.text(
    `${t("data.stats.improvement")}: ${stats?.improvement || 0}${t(
      "data.export.points"
    )}`,
    20,
    100
  );
  doc.text(
    `${t("data.export.consistency")}: ${stats?.consistency || 0}%`,
    20,
    110
  );

  // 자세 분포 정보
  doc.text(
    `${t("detection.posture.perfect")}: ${stats?.excellentCount || 0}${t(
      "data.export.times"
    )}`,
    80,
    70
  );
  doc.text(
    `${t("detection.posture.good")}: ${stats?.goodPostureCount || 0}${t(
      "data.export.times"
    )}`,
    80,
    80
  );
  doc.text(
    `${t("detection.posture.normal")}: ${stats?.normalPostureCount || 0}${t(
      "data.export.times"
    )}`,
    80,
    90
  );
  doc.text(
    `${t("detection.posture.bad")}: ${stats?.poorPostureCount || 0}${t(
      "data.export.times"
    )}`,
    80,
    100
  );

  // 측정 지표 정보
  doc.setFontSize(14);
  doc.text(t("data.metrics.title"), 20, 125);
  doc.setFontSize(8);
  doc.text(
    `${t("detection.metrics.neckAngle")}: -45°~45° | ${t(
      "detection.metrics.shoulderSlope"
    )}: -10°~10° | ${t("detection.metrics.headForward")}: ≤15%`,
    20,
    135
  );
  doc.text(
    `${t("detection.metrics.shoulderHeightDiff")}: ≤8% | ${t(
      "data.export.cervicalLordosis"
    )}: -30°~30° | ${t("data.export.forwardHeadDistance")}: ≤100mm`,
    20,
    145
  );
  doc.text(
    `${t("data.export.headTilt")}: -15°~15° | ${t(
      "data.export.headRotation"
    )}: ≤15° | ${t("data.export.shoulderHeightDiffMm")}: ≤40mm`,
    20,
    155
  );
  doc.text(
    `${t("data.export.scapularWinging")}: ${t("data.export.none")} | ${t(
      "data.export.shoulderForwardMovement"
    )}: ≤150mm`,
    20,
    165
  );

  // 데이터 테이블 생성 (헤더는 영어)
  const headers = [
    "Date/Time",
    "Score",
    "Status",
    "Neck Angle",
    "Shoulder Slope",
    "Head Forward",
    "Shoulder Height Diff",
    "Cervical Lordosis",
    "Forward Head Distance",
    "Head Tilt",
    "Head Rotation",
    "Shoulder Height Diff (mm)",
    "Scapular Winging (L)",
    "Scapular Winging (R)",
    "Shoulder Forward Movement",
    "Feedback",
  ];

  const tableData = filteredHistory
    .slice()
    .reverse()
    .slice(0, 20) // 최근 20개만 표시 (PDF 공간 제약)
    .map((record) => {
      const status = safeGetScoreStatus(record.score);
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
        safeFormatDate(record.timestamp),
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
        feedback.length > 50 ? feedback.substring(0, 50) + "..." : feedback,
      ];
    });

  // 테이블 생성
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 180,
    theme: "grid",
    styles: {
      font: "NotoSansKR",
      fontSize: 6,
      cellPadding: 1,
      overflow: "linebreak",
      halign: "center",
    },
    headStyles: {
      font: "NotoSansKR",
      fontStyle: "bold",
      fontSize: 6,
      fillColor: [41, 128, 185],
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    tableWidth: "100%",
    margin: { left: 10, right: 10 },
  });

  // 페이지 번호 추가
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`${t("data.export.page")} ${i} / ${pageCount}`, 140, 200, {
      align: "center",
    });
  }

  // PDF 파일 다운로드
  doc.save(
    `${t("data.export.postureData")}_${t("data.export.report")}_$${
      new Date().toISOString().split("T")[0]
    }.pdf`
  );
}
