import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

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
import { exportCsv } from "../components/dataexport/ExportCsv.jsx";
import { exportPDF } from "../components/dataexport/PdfExport.jsx";

const PostureData = () => {
  const { t, i18n } = useTranslation();
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  // 날짜 필터 상태
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // 커스텀 훅들 사용
  const {
    filteredHistory,
    stats,
    timeFilter,
    loading,
    error,
    applyTimeFilter,
    clearData,
    loadPostureHistory,
  } = usePostureData();

  const { prepareChartData, preparePieChartData, prepareMetricsChartData } =
    useChartData();

  const { currentPage, totalPages, currentData, handlePageChange, resetPage } =
    usePagination(filteredHistory, 20);

  const { rechartsLoaded, rechartsComponents } = useRecharts();

  // PieChart 데이터 useMemo로 생성 (언어 변경 시 갱신)
  const pieChartData = useMemo(
    () => preparePieChartData(filteredHistory, t, i18n.language),
    [filteredHistory, t, i18n.language]
  );
  // MetricsChart 라벨 useMemo 예시 (MetricsChart 내부 리팩토링 필요)

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
    const localeMap = {
      ko: "ko-KR",
      en: "en-US",
      ja: "ja-JP",
    };

    const locale = localeMap[i18n.language] || "ko-KR";

    return new Date(timestamp).toLocaleString(locale, {
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

  // CSV 데이터 내보내기
  const handleExportCsv = useCallback(() => {
    exportCsv(filteredHistory, startDate, endDate, t, i18n.language);
  }, [filteredHistory, startDate, endDate, t, i18n.language]);

  // PDF 데이터 내보내기
  const handleExportPdf = useCallback(() => {
    exportPDF({
      filteredHistory,
      stats,
      t,
      getScoreStatus,
      formatDate,
      language: i18n.language,
    });
  }, [filteredHistory, stats, t, getScoreStatus, formatDate, i18n.language]);

  return (
    <DataContainer>
      <Header>
        <h1>{t("data.title")}</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <ExportButton onClick={handleExportCsv}>
            {t("data.export.csv")}
          </ExportButton>
          <ExcelExportButton onClick={handleExportPdf}>
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

      {/* 로딩 상태 */}
      {loading && (
        <EmptyState>
          <h3>데이터를 불러오는 중...</h3>
          <p>잠시만 기다려주세요.</p>
        </EmptyState>
      )}

      {/* 에러 상태 */}
      {error && !loading && (
        <EmptyState>
          <h3>데이터 로드 실패</h3>
          <p>{error}</p>
          <button
            onClick={loadPostureHistory}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </EmptyState>
      )}

      {/* 통계 카드 */}
      {stats && !loading && !error ? (
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
      ) : !loading && !error ? (
        <EmptyState>
          <h3>{t("data.export.noData")}</h3>
          <p>{t("data.export.noDataMessage")}</p>
        </EmptyState>
      ) : null}

      {/* 차트 컨테이너 */}
      {rechartsLoaded && !loading && !error && (
        <ChartContainer>
          <h3>{t("data.chart.scoreTrend")}</h3>
          <ScoreChart
            data={prepareChartData(filteredHistory, i18n.language)}
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
            data={pieChartData}
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
            data={prepareMetricsChartData(filteredByDate, i18n.language)}
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
              placeholder={t("date.start")}
            />
            <span>~</span>
            <CustomDatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder={t("date.end")}
            />
            <ToggleButton
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            >
              {isHistoryExpanded ? "접기" : "펼치기"}
            </ToggleButton>
          </div>
        </HistoryHeader>

        {isHistoryExpanded && !loading && !error && (
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
