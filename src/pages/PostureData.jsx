import React, { useState, useCallback } from "react";
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
    const afterStart = !startDate || t >= new Date(startDate).getTime();
    const beforeEnd =
      !endDate || t <= new Date(endDate).setHours(23, 59, 59, 999);
    return afterStart && beforeEnd;
  });

  // 데이터 내보내기
  const exportData = useCallback(() => {
    // CSV 헤더 생성 (최신 지표 포함)
    const headers = [
      "날짜/시간",
      "점수",
      "상태",
      "목 각도(도)",
      "어깨 기울기(도)",
      "머리 전방 돌출도(%)",
      "어깨 높이 차이(%)",
      "목 전만각(도)",
      "머리 전방 이동 거리(mm)",
      "머리 좌우 기울기(도)",
      "머리 좌우 회전(도)",
      "어깨 높이 차이(mm)",
      "견갑골 돌출(좌)",
      "견갑골 돌출(우)",
      "어깨 전방 이동(mm)",
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
    link.download = `자세데이터_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    trackDataExport("csv", {
      recordCount: filteredHistory.length,
      dateRange: `${startDate} ~ ${endDate}`,
    });
  }, [filteredHistory, getScoreStatus, formatDate, startDate, endDate]);

  // PDF 리포트 생성
  const exportPDF = useCallback(() => {
    // PDF 문서 생성 (가로 방향)
    const doc = new jsPDF("landscape", "mm", "a4");

    // 제목 추가
    doc.setFontSize(20);
    doc.text("자세 데이터 분석 리포트", 140, 20, { align: "center" });

    // 생성일 추가
    doc.setFontSize(12);
    doc.text(`생성일: ${new Date().toLocaleString("ko-KR")}`, 20, 35);
    doc.text(`총 기록 수: ${filteredHistory.length}개`, 20, 45);

    // 통계 정보 추가
    doc.setFontSize(14);
    doc.text("통계 요약", 20, 60);
    doc.setFontSize(10);
    doc.text(`평균 점수: ${stats?.avgScore || 0}점`, 20, 70);
    doc.text(`최고 점수: ${stats?.maxScore || 0}점`, 20, 80);
    doc.text(`최저 점수: ${stats?.minScore || 0}점`, 20, 90);
    doc.text(`개선도: ${stats?.improvement || 0}점`, 20, 100);
    doc.text(`일관성: ${stats?.consistency || 0}%`, 20, 110);

    // 자세 분포 정보
    doc.text(`완벽한 자세: ${stats?.excellentCount || 0}회`, 80, 70);
    doc.text(`좋은 자세: ${stats?.goodPostureCount || 0}회`, 80, 80);
    doc.text(`보통 자세: ${stats?.normalPostureCount || 0}회`, 80, 90);
    doc.text(`나쁜 자세: ${stats?.poorPostureCount || 0}회`, 80, 100);

    // 측정 지표 정보
    doc.setFontSize(14);
    doc.text("측정 지표 (총 10개)", 20, 125);
    doc.setFontSize(8);
    doc.text(
      "목 각도: -45°~45° | 어깨 기울기: -10°~10° | 머리 전방 돌출도: ≤15%",
      20,
      135
    );
    doc.text(
      "어깨 높이 차이: ≤8% | 목 전만각: -30°~30° | 머리 전방 이동: ≤100mm",
      20,
      145
    );
    doc.text(
      "머리 좌우 기울기: -15°~15° | 머리 좌우 회전: ≤15° | 어깨 높이 차이(mm): ≤40mm",
      20,
      155
    );
    doc.text("견갑골 돌출: 없음 | 어깨 전방 이동: ≤150mm", 20, 165);

    // 데이터 테이블 생성
    const headers = [
      "날짜/시간",
      "점수",
      "상태",
      "목각도",
      "어깨기울기",
      "머리전방돌출",
      "어깨높이차이",
      "목전만각",
      "머리전방이동",
      "머리좌우기울기",
      "머리좌우회전",
      "어깨높이차이(mm)",
      "견갑골돌출(좌)",
      "견갑골돌출(우)",
      "어깨전방이동",
      "자세피드백",
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
      doc.text(`페이지 ${i} / ${pageCount}`, 140, 200, { align: "center" });
    }

    // PDF 파일 다운로드
    doc.save(`자세데이터_리포트_${new Date().toISOString().split("T")[0]}.pdf`);
    trackDataExport("pdf", {
      recordCount: filteredHistory.length,
      dateRange: `${startDate} ~ ${endDate}`,
    });
  }, [filteredHistory, getScoreStatus, formatDate, stats, startDate, endDate]);

  return (
    <DataContainer>
      <Header>
        <h1>자세 데이터 분석</h1>
        <div>
          <ExportButton onClick={exportData}>CSV 내보내기</ExportButton>
          <ExcelExportButton onClick={exportPDF}>PDF 리포트</ExcelExportButton>
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
                expanded={isHistoryExpanded.toString()}
              >
                {isHistoryExpanded ? "▼" : "▶"}
              </ToggleButton>
            </HistoryHeader>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <CustomDatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="시작일 선택"
              />
              <span>~</span>
              <CustomDatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="종료일 선택"
              />
            </div>
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
