import React, { useState, useCallback } from "react";
import * as XLSX from "xlsx";
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
import DateRangePicker from "../components/common/DateRangePicker";

const PostureData = () => {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  // 날짜 필터 상태
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // 커스텀 훅들 사용
  const { filteredHistory, stats, timeFilter, applyTimeFilter, clearData } =
    usePostureData();

  const { prepareChartData, preparePieChartData, prepareMetricsChartData } =
    useChartData();

  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    currentData,
    handlePageChange,
    resetPage,
  } = usePagination(filteredHistory, 20);

  const { rechartsLoaded, rechartsComponents } = useRecharts();

  // 점수에 따른 상태 반환
  const getScoreStatus = (score) => {
    if (score >= 90) return { text: "완벽한 자세", color: "excellent" };
    if (score >= 60) return { text: "좋은 자세", color: "good" };
    if (score >= 50) return { text: "보통 자세", color: "average" };
    return { text: "나쁜 자세", color: "poor" };
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
    const afterStart = !startDate || t >= startDate.getTime();
    const beforeEnd = !endDate || t <= endDate.setHours(23, 59, 59, 999);
    return afterStart && beforeEnd;
  });

  // 데이터 내보내기
  const exportData = useCallback(() => {
    // CSV 헤더 생성
    const headers = [
      "날짜/시간",
      "점수",
      "상태",
      "목 각도(도)",
      "어깨 기울기(도)",
      "머리 전방 돌출도(%)",
      "어깨 높이 차이(%)",
      "자세 피드백",
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
    link.download = `자세데이터_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredHistory, getScoreStatus, formatDate]);

  // 엑셀 형식으로 내보내기
  const exportExcel = useCallback(() => {
    // 워크북 생성
    const wb = XLSX.utils.book_new();

    // 데이터 시트 생성
    const headers = [
      "날짜/시간",
      "점수",
      "상태",
      "목 각도(도)",
      "어깨 기울기(도)",
      "머리 전방 돌출도(%)",
      "어깨 높이 차이(%)",
      "자세 피드백",
    ];

    const excelData = filteredHistory
      .slice()
      .reverse()
      .map((record) => {
        const status = getScoreStatus(record.score);
        const feedback = record.issues ? record.issues.join("; ") : "";

        return [
          formatDate(record.timestamp),
          record.score,
          status.text,
          parseFloat(record.neckAngle),
          parseFloat(record.shoulderSlope),
          parseFloat(record.headForward),
          parseFloat(record.shoulderHeightDiff),
          feedback,
        ];
      });

    // 헤더와 데이터 결합
    const worksheetData = [headers, ...excelData];

    // 워크시트 생성
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // 열 너비 설정
    const colWidths = [
      { wch: 20 }, // 날짜/시간
      { wch: 8 }, // 점수
      { wch: 10 }, // 상태
      { wch: 12 }, // 목 각도
      { wch: 12 }, // 어깨 기울기
      { wch: 15 }, // 머리 전방 돌출도
      { wch: 12 }, // 어깨 높이 차이
      { wch: 30 }, // 자세 피드백
    ];
    ws["!cols"] = colWidths;

    // 점수에 따른 셀 스타일 설정
    excelData.forEach((row, index) => {
      const score = row[1];
      const scoreCell = XLSX.utils.encode_cell({ r: index + 1, c: 1 });

      if (score >= 90) {
        ws[scoreCell].s = { fill: { fgColor: { rgb: "C6EFCE" } } }; // 연한 초록 (완벽한 자세)
      } else if (score >= 60) {
        ws[scoreCell].s = { fill: { fgColor: { rgb: "BBDEFB" } } }; // 연한 파랑 (좋은 자세)
      } else if (score >= 50) {
        ws[scoreCell].s = { fill: { fgColor: { rgb: "FFE0B2" } } }; // 연한 주황 (보통 자세)
      } else {
        ws[scoreCell].s = { fill: { fgColor: { rgb: "FFCDD2" } } }; // 연한 빨강 (나쁜 자세)
      }
    });

    // 통계 시트 생성
    const statsData = [
      ["자세 데이터 통계 리포트"],
      [""],
      ["생성일", new Date().toLocaleString("ko-KR")],
      ["총 기록 수", filteredHistory.length],
      ["평균 점수", stats?.avgScore || 0],
      ["좋은 자세 횟수", stats?.goodPostureCount || 0],
      ["나쁜 자세 횟수", stats?.poorPostureCount || 0],
      ["완벽 자세 횟수", stats?.excellentCount || 0],
      ["보통 자세 횟수", stats?.normalPostureCount || 0],
      ["개선도", stats?.improvement || 0],
      ["일관성", stats?.consistency || 0],
      ["최고 점수", stats?.maxScore || 0],
      ["최저 점수", stats?.minScore || 0],
      [""],
      ["점수 기준"],
      ["90점 이상", "완벽한 자세"],
      ["60-89점", "좋은 자세"],
      ["50-59점", "보통 자세"],
      ["50점 미만", "나쁜 자세"],
    ];

    const statsWs = XLSX.utils.aoa_to_sheet(statsData);
    statsWs["!cols"] = [{ wch: 20 }, { wch: 15 }];

    // 워크북에 시트 추가
    XLSX.utils.book_append_sheet(wb, ws, "자세 데이터");
    XLSX.utils.book_append_sheet(wb, statsWs, "통계 요약");

    // 엑셀 파일 다운로드
    XLSX.writeFile(
      wb,
      `자세데이터_리포트_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  }, [filteredHistory, getScoreStatus, formatDate, stats]);

  return (
    <DataContainer>
      <Header>
        <h1>자세 데이터 분석</h1>
        <div>
          <ExportButton onClick={exportData}>CSV 내보내기</ExportButton>
          <ExcelExportButton onClick={exportExcel}>
            엑셀 리포트
          </ExcelExportButton>
          <ClearButton onClick={clearData}>데이터 초기화</ClearButton>
        </div>
      </Header>

      <FilterContainer>
        <FilterButton
          active={timeFilter === "all"}
          onClick={() => handleTimeFilter("all")}
        >
          전체
        </FilterButton>
        <FilterButton
          active={timeFilter === "today"}
          onClick={() => handleTimeFilter("today")}
        >
          오늘
        </FilterButton>
        <FilterButton
          active={timeFilter === "week"}
          onClick={() => handleTimeFilter("week")}
        >
          이번 주
        </FilterButton>
        <FilterButton
          active={timeFilter === "month"}
          onClick={() => handleTimeFilter("month")}
        >
          이번 달
        </FilterButton>
      </FilterContainer>

      {stats ? (
        <>
          <StatsGrid>
            <StatCard isGood={parseFloat(stats.avgScore) >= 60}>
              <StatLabel>평균 점수</StatLabel>
              <StatValue>{stats.avgScore}점</StatValue>
            </StatCard>

            <StatCard isGood={stats.excellentCount > 0} postureType="excellent">
              <StatLabel>완벽한 자세</StatLabel>
              <StatValue>{stats.excellentCount}회</StatValue>
            </StatCard>

            <StatCard
              isGood={stats.goodPostureCount > stats.poorPostureCount}
              postureType="good"
            >
              <StatLabel>좋은 자세</StatLabel>
              <StatValue>{stats.goodPostureCount}회</StatValue>
            </StatCard>

            <StatCard
              isGood={stats.normalPostureCount > 0}
              postureType="average"
            >
              <StatLabel>보통 자세</StatLabel>
              <StatValue>{stats.normalPostureCount}회</StatValue>
            </StatCard>

            <StatCard isGood={stats.poorPostureCount < 5} postureType="poor">
              <StatLabel>나쁜 자세</StatLabel>
              <StatValue>{stats.poorPostureCount}회</StatValue>
            </StatCard>

            <StatCard isGood={parseFloat(stats.improvement) > 0}>
              <StatLabel>개선도</StatLabel>
              <StatValue>{stats.improvement}점</StatValue>
            </StatCard>

            <StatCard isGood={parseFloat(stats.consistency) >= 50}>
              <StatLabel>일관성</StatLabel>
              <StatValue>{stats.consistency}%</StatValue>
            </StatCard>

            <StatCard isGood={stats.maxScore >= 90}>
              <StatLabel>최고 점수</StatLabel>
              <StatValue>{stats.maxScore}점</StatValue>
            </StatCard>
          </StatsGrid>

          <ChartContainer>
            <HistoryHeader>
              <h3>점수 변화 그래프</h3>
            </HistoryHeader>
            {filteredHistory.length > 0 &&
              rechartsLoaded &&
              rechartsComponents && (
                <ScoreChart
                  data={prepareChartData(filteredHistory)}
                  rechartsComponents={rechartsComponents}
                />
              )}

            <HistoryHeader>
              <h3>자세 분포 분석</h3>
            </HistoryHeader>
            {filteredHistory.length > 0 &&
              rechartsLoaded &&
              rechartsComponents && (
                <PosturePieChart
                  data={preparePieChartData(filteredHistory)}
                  rechartsComponents={rechartsComponents}
                />
              )}

            <HistoryHeader>
              <h3>자세 지표 변화</h3>
            </HistoryHeader>
            {filteredHistory.length > 0 &&
              rechartsLoaded &&
              rechartsComponents && (
                <MetricsChart
                  data={prepareMetricsChartData(filteredByDate)}
                  rechartsComponents={rechartsComponents}
                />
              )}
          </ChartContainer>

          <DataHistoryContainer>
            <HistoryHeader>
              <h3>자세 기록 히스토리</h3>
              <ToggleButton
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                expanded={isHistoryExpanded}
              >
                {isHistoryExpanded ? "▼" : "▶"}
              </ToggleButton>
            </HistoryHeader>
            {/* 기간 선택 달력: 제목 바로 아래에 위치 */}
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={({ startDate, endDate }) => {
                setStartDate(startDate);
                setEndDate(endDate);
              }}
              label={null}
              style={{ marginBottom: 8 }}
            />
            {isHistoryExpanded && (
              <PostureHistoryTable
                filteredHistory={filteredByDate}
                currentPage={currentPage}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                currentData={currentData}
                handlePageChange={handlePageChange}
                getScoreStatus={getScoreStatus}
                formatDate={formatDate}
              />
            )}
          </DataHistoryContainer>
        </>
      ) : (
        <EmptyState>
          <h3>자세 데이터가 없습니다</h3>
          <p>자세 감지를 시작하여 데이터를 수집해보세요.</p>
        </EmptyState>
      )}
    </DataContainer>
  );
};

export default PostureData;
