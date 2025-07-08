import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  DataContainer,
  Header,
  StatsGrid,
  StatCard,
  StatLabel,
  StatValue,
  ChartContainer,
  DataHistoryContainer,
  FilterContainer,
  FilterButton,
  EmptyState,
  ExportButton,
  ExcelExportButton,
  ClearButton,
  HistoryHeader,
  ToggleButton,
} from "../styles/PostureData.styles";
// 차트 컴포넌트들 import
import ScoreChart from "../components/charts/ScoreChart";
import PosturePieChart from "../components/charts/PieChart";
import MetricsChart from "../components/charts/MetricsChart";
import PostureHistoryTable from "../components/history/PostureHistoryTable";
// 커스텀 훅들 import
import usePostureData from "../hooks/usePostureData.jsx";
import useChartData from "../hooks/useChartData.jsx";
import usePagination from "../hooks/usePagination.jsx";
import useRecharts from "../hooks/useRecharts.jsx";
import CustomDatePicker from "../components/common/CustomDatePicker";
import { trackDataExport } from "../utils/analytics";

const PostureData = () => {
  const { t } = useTranslation();
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  // 날짜 필터 상태
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // 커스텀 훅들 사용
  const { filteredHistory, stats, timeFilter, applyTimeFilter, clearData } =
    usePostureData();

  const { prepareChartData, preparePieChartData, prepareMetricsChartData } =
    useChartData();

  const { currentPage, totalPages, currentData, handlePageChange, resetPage } =
    usePagination(filteredHistory, 20);

  const { rechartsLoaded, rechartsComponents } = useRecharts();

  // 점수에 따른 상태 반환
  const getScoreStatus = (score) => {
    if (score >= 90)
      return { text: t("detection.posture.perfect"), color: "excellent" };
    if (score >= 60)
      return { text: t("detection.posture.good"), color: "good" };
    if (score >= 50)
      return { text: t("detection.posture.normal"), color: "average" };
    return { text: t("detection.posture.bad"), color: "poor" };
  };

  // 날짜 포맷팅
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 시간 필터 적용 (페이지 리셋 포함)
  const handleTimeFilter = useCallback(
    (filter) => {
      resetPage();
      applyTimeFilter(filter);
    },
    [applyTimeFilter, resetPage]
  );

  // 날짜 필터링된 히스토리
  const filteredByDate = filteredHistory.filter((item) => {
    const t = item.timestamp;
    const afterStart = !startDate || t >= new Date(startDate).getTime();
    const beforeEnd =
      !endDate || t <= new Date(endDate).setHours(23, 59, 59, 999);
    return afterStart && beforeEnd;
  });

  // 데이터 내보내기
  const exportData = useCallback(() => {
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
        const status = getScoreStatus(record.score);
        const feedback = record.issues ? record.issues.join("; ") : "";

        return [
          formatDate(record.timestamp),
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
  }, [filteredHistory, getScoreStatus, formatDate, startDate, endDate, t]);

  // PDF 리포트 생성
  const exportPDF = useCallback(() => {
    // PDF 문서 생성 (가로 방향)
    const doc = new jsPDF("landscape", "mm", "a4");

    // 제목 추가
    doc.setFontSize(20);
    doc.text(t("data.export.postureAnalysisReport"), 140, 20, {
      align: "center",
    });

    // 생성일 추가
    doc.setFontSize(12);
    doc.text(
      `${t("data.export.generatedDate")}: ${new Date().toLocaleString(
        "ko-KR"
      )}`,
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

    // 데이터 테이블 생성
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

    const tableData = filteredHistory
      .slice()
      .reverse()
      .slice(0, 20) // 최근 20개만 표시 (PDF 공간 제약)
      .map((record) => {
        const status = getScoreStatus(record.score);
        const feedback = record.issues ? record.issues.join("; ") : "";

        return [
          formatDate(record.timestamp),
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
        fontSize: 6,
        cellPadding: 1,
        overflow: "linebreak",
        halign: "center",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 25 }, // 날짜/시간
        1: { cellWidth: 8 }, // 점수
        2: { cellWidth: 12 }, // 상태
        3: { cellWidth: 10 }, // 목각도
        4: { cellWidth: 10 }, // 어깨기울기
        5: { cellWidth: 12 }, // 머리전방돌출
        6: { cellWidth: 10 }, // 어깨높이차이
        7: { cellWidth: 10 }, // 목전만각
        8: { cellWidth: 12 }, // 머리전방이동
        9: { cellWidth: 12 }, // 머리좌우기울기
        10: { cellWidth: 12 }, // 머리좌우회전
        11: { cellWidth: 12 }, // 어깨높이차이(mm)
        12: { cellWidth: 10 }, // 견갑골돌출(좌)
        13: { cellWidth: 10 }, // 견갑골돌출(우)
        14: { cellWidth: 12 }, // 어깨전방이동
        15: { cellWidth: 25 }, // 자세피드백
      },
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
      `${t("data.export.postureData")}_${t("data.export.report")}_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
    trackDataExport("pdf", {
      recordCount: filteredHistory.length,
      dateRange: `${startDate} ~ ${endDate}`,
    });
  }, [
    filteredHistory,
    getScoreStatus,
    formatDate,
    stats,
    startDate,
    endDate,
    t,
  ]);

  return (
    <DataContainer>
      <Header>
        <h1>{t("data.title")}</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <ExportButton onClick={exportData}>
            {t("data.export.csv")}
          </ExportButton>
          <ExcelExportButton onClick={exportPDF}>
            {t("data.export.pdf")}
          </ExcelExportButton>
          <ClearButton onClick={clearData}>{t("data.clear")}</ClearButton>
        </div>
      </Header>

      {/* 기간 필터만 남긴 컨테이너 */}
      <FilterContainer>
        <div>
          <h3>{t("data.filter.title")}</h3>
          <div>
            <FilterButton
              onClick={() => handleTimeFilter("all")}
              $isActive={timeFilter === "all"}
            >
              {t("data.filter.all")}
            </FilterButton>
            <FilterButton
              onClick={() => handleTimeFilter("today")}
              $isActive={timeFilter === "today"}
            >
              {t("data.filter.today")}
            </FilterButton>
            <FilterButton
              onClick={() => handleTimeFilter("thisWeek")}
              $isActive={timeFilter === "thisWeek"}
            >
              {t("data.filter.thisWeek")}
            </FilterButton>
            <FilterButton
              onClick={() => handleTimeFilter("thisMonth")}
              $isActive={timeFilter === "thisMonth"}
            >
              {t("data.filter.thisMonth")}
            </FilterButton>
          </div>
        </div>
      </FilterContainer>

      {/* 통계 카드 */}
      {stats ? (
        <StatsGrid>
          <StatCard $isGood={parseFloat(stats.avgScore) >= 60}>
            <StatLabel>{t("data.stats.averageScore")}</StatLabel>
            <StatValue>{stats.avgScore}점</StatValue>
          </StatCard>

          <StatCard $isGood={stats.excellentCount > 0} $postureType="excellent">
            <StatLabel>{t("detection.posture.perfect")}</StatLabel>
            <StatValue>{stats.excellentCount}회</StatValue>
          </StatCard>

          <StatCard
            $isGood={stats.goodPostureCount > stats.poorPostureCount}
            $postureType="good"
          >
            <StatLabel>{t("detection.posture.good")}</StatLabel>
            <StatValue>{stats.goodPostureCount}회</StatValue>
          </StatCard>

          <StatCard
            $isGood={stats.normalPostureCount > 0}
            $postureType="average"
          >
            <StatLabel>{t("detection.posture.normal")}</StatLabel>
            <StatValue>{stats.normalPostureCount}회</StatValue>
          </StatCard>

          <StatCard $isGood={stats.poorPostureCount < 5} $postureType="poor">
            <StatLabel>{t("detection.posture.bad")}</StatLabel>
            <StatValue>{stats.poorPostureCount}회</StatValue>
          </StatCard>

          <StatCard $isGood={parseFloat(stats.improvement) > 0}>
            <StatLabel>{t("data.stats.improvement")}</StatLabel>
            <StatValue>{stats.improvement}점</StatValue>
          </StatCard>

          <StatCard $isGood={parseFloat(stats.consistency) >= 50}>
            <StatLabel>{t("data.export.consistency")}</StatLabel>
            <StatValue>{stats.consistency}%</StatValue>
          </StatCard>

          <StatCard $isGood={stats.maxScore >= 90}>
            <StatLabel>{t("data.stats.bestScore")}</StatLabel>
            <StatValue>{stats.maxScore}점</StatValue>
          </StatCard>
        </StatsGrid>
      ) : (
        <EmptyState>
          <h3>{t("data.export.noData")}</h3>
          <p>{t("data.export.noDataMessage")}</p>
        </EmptyState>
      )}

      {/* 차트 컨테이너 */}
      {rechartsLoaded && (
        <ChartContainer>
          <h3>{t("data.chart.scoreTrend")}</h3>
          <ScoreChart
            data={prepareChartData(filteredHistory)}
            rechartsComponents={rechartsComponents}
          />
          <hr
            style={{
              margin: "2rem 0",
              border: 0,
              borderTop: "1.5px solid #eee",
            }}
          />
          <h3>{t("data.chart.postureDistribution")}</h3>
          <PosturePieChart
            data={preparePieChartData(filteredHistory)}
            rechartsComponents={rechartsComponents}
          />
          <hr
            style={{
              margin: "2rem 0",
              border: 0,
              borderTop: "1.5px solid #eee",
            }}
          />
          <h3>{t("data.chart.metrics")}</h3>
          <MetricsChart
            data={prepareMetricsChartData(filteredByDate)}
            rechartsComponents={rechartsComponents}
          />
        </ChartContainer>
      )}

      {/* 데이터 히스토리 컨테이너 */}
      <DataHistoryContainer>
        <HistoryHeader>
          <h2>{t("data.export.history")}</h2>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <CustomDatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="시작일"
            />
            <span>~</span>
            <CustomDatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="종료일"
            />
            <ToggleButton
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            >
              {isHistoryExpanded ? "접기" : "펼치기"}
            </ToggleButton>
          </div>
        </HistoryHeader>

        {isHistoryExpanded && (
          <>
            {filteredByDate.length === 0 ? (
              <EmptyState>
                <p>{t("data.export.noData")}</p>
              </EmptyState>
            ) : (
              <PostureHistoryTable
                data={currentData}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                getScoreStatus={getScoreStatus}
                formatDate={formatDate}
              />
            )}
          </>
        )}
      </DataHistoryContainer>
    </DataContainer>
  );
};

export default PostureData;
