import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  DataContainer,
  Header,
  StatsGrid,
  StatCard,
  StatLabel,
  StatValue,
  ChartContainer,
  HistoryTable,
  TableHeader,
  TableRow,
  TableCell,
  FilterContainer,
  FilterButton,
  EmptyState,
  ExportButton,
  ExcelExportButton,
  ClearButton,
} from "../styles/PostureData.styles";

const PostureData = () => {
  const [postureHistory, setPostureHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all"); // all, today, week, month

  // 점수에 따른 상태 반환
  const getScoreStatus = (score) => {
    if (score >= 90) return { text: "완벽", color: "excellent" };
    if (score >= 80) return { text: "좋음", color: "good" };
    if (score >= 65) return { text: "보통", color: "average" };
    if (score >= 50) return { text: "주의", color: "warning" };
    return { text: "나쁨", color: "poor" };
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

  // 자세 히스토리 로드
  const loadPostureHistory = useCallback(() => {
    const history = JSON.parse(localStorage.getItem("postureHistory") || "[]");
    setPostureHistory(history);
    setFilteredHistory(history);
  }, []);

  // 통계 계산
  const calculateStats = useCallback((data) => {
    if (data.length === 0) {
      setStats(null);
      return;
    }

    const avgScore =
      data.reduce((sum, record) => sum + record.score, 0) / data.length;
    const goodPostureCount = data.filter((record) => record.score >= 80).length;
    const poorPostureCount = data.filter((record) => record.score < 50).length;
    const excellentCount = data.filter((record) => record.score >= 90).length;

    // 개선도 계산 (최근 10개 vs 이전 10개)
    const recentScores = data.slice(-10).map((record) => record.score);
    const previousScores = data.slice(-20, -10).map((record) => record.score);

    let improvement = 0;
    if (recentScores.length >= 5 && previousScores.length >= 5) {
      const recentAvg =
        recentScores.reduce((sum, score) => sum + score, 0) /
        recentScores.length;
      const previousAvg =
        previousScores.reduce((sum, score) => sum + score, 0) /
        previousScores.length;
      improvement = recentAvg - previousAvg;
    }

    // 최고 점수와 최저 점수
    const maxScore = Math.max(...data.map((record) => record.score));
    const minScore = Math.min(...data.map((record) => record.score));

    setStats({
      avgScore: avgScore.toFixed(1),
      goodPostureCount,
      poorPostureCount,
      excellentCount,
      totalRecords: data.length,
      improvement: improvement.toFixed(1),
      maxScore,
      minScore,
      consistency: ((goodPostureCount / data.length) * 100).toFixed(1),
    });
  }, []);

  // 시간 필터 적용
  const applyTimeFilter = useCallback(
    (filter) => {
      setTimeFilter(filter);

      const now = Date.now();
      let filteredData = [...postureHistory];

      switch (filter) {
        case "today": {
          const todayStart = new Date().setHours(0, 0, 0, 0);
          filteredData = postureHistory.filter(
            (record) => record.timestamp >= todayStart
          );
          break;
        }
        case "week": {
          const weekStart = now - 7 * 24 * 60 * 60 * 1000;
          filteredData = postureHistory.filter(
            (record) => record.timestamp >= weekStart
          );
          break;
        }
        case "month": {
          const monthStart = now - 30 * 24 * 60 * 60 * 1000;
          filteredData = postureHistory.filter(
            (record) => record.timestamp >= monthStart
          );
          break;
        }
        default:
          filteredData = postureHistory;
      }

      setFilteredHistory(filteredData);
      calculateStats(filteredData);
    },
    [postureHistory, calculateStats]
  );

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

      if (score >= 80) {
        ws[scoreCell].s = { fill: { fgColor: { rgb: "C6EFCE" } } }; // 연한 초록
      } else if (score >= 65) {
        ws[scoreCell].s = { fill: { fgColor: { rgb: "BBDEFB" } } }; // 연한 파랑
      } else if (score >= 50) {
        ws[scoreCell].s = { fill: { fgColor: { rgb: "FFE0B2" } } }; // 연한 주황
      } else {
        ws[scoreCell].s = { fill: { fgColor: { rgb: "FFCDD2" } } }; // 연한 빨강
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
      ["개선도", stats?.improvement || 0],
      ["일관성", stats?.consistency || 0],
      ["최고 점수", stats?.maxScore || 0],
      ["최저 점수", stats?.minScore || 0],
      [""],
      ["점수 기준"],
      ["80점 이상", "좋음"],
      ["65-79점", "보통"],
      ["50-64점", "주의"],
      ["50점 미만", "나쁨"],
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

  // 데이터 초기화
  const clearData = useCallback(() => {
    if (
      window.confirm(
        "모든 자세 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      localStorage.removeItem("postureHistory");
      setPostureHistory([]);
      setFilteredHistory([]);
      setStats(null);
    }
  }, []);

  useEffect(() => {
    loadPostureHistory();
  }, [loadPostureHistory]);

  useEffect(() => {
    calculateStats(filteredHistory);
  }, [filteredHistory, calculateStats]);

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
          onClick={() => applyTimeFilter("all")}
        >
          전체
        </FilterButton>
        <FilterButton
          active={timeFilter === "today"}
          onClick={() => applyTimeFilter("today")}
        >
          오늘
        </FilterButton>
        <FilterButton
          active={timeFilter === "week"}
          onClick={() => applyTimeFilter("week")}
        >
          이번 주
        </FilterButton>
        <FilterButton
          active={timeFilter === "month"}
          onClick={() => applyTimeFilter("month")}
        >
          이번 달
        </FilterButton>
      </FilterContainer>

      {stats ? (
        <>
          <StatsGrid>
            <StatCard isGood={parseFloat(stats.avgScore) >= 80}>
              <StatLabel>평균 점수</StatLabel>
              <StatValue>{stats.avgScore}점</StatValue>
            </StatCard>

            <StatCard isGood={stats.goodPostureCount > stats.poorPostureCount}>
              <StatLabel>좋은 자세</StatLabel>
              <StatValue>{stats.goodPostureCount}회</StatValue>
            </StatCard>

            <StatCard isGood={stats.poorPostureCount < 5}>
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

            <StatCard isGood={stats.excellentCount > 0}>
              <StatLabel>완벽 자세</StatLabel>
              <StatValue>{stats.excellentCount}회</StatValue>
            </StatCard>

            <StatCard isGood={stats.maxScore >= 90}>
              <StatLabel>최고 점수</StatLabel>
              <StatValue>{stats.maxScore}점</StatValue>
            </StatCard>

            <StatCard isGood={stats.minScore >= 50}>
              <StatLabel>최저 점수</StatLabel>
              <StatValue>{stats.minScore}점</StatValue>
            </StatCard>
          </StatsGrid>

          <ChartContainer>
            <h3>자세 기록 히스토리</h3>
            {filteredHistory.length > 0 ? (
              <HistoryTable>
                <thead>
                  <TableRow>
                    <TableHeader>날짜/시간</TableHeader>
                    <TableHeader>점수</TableHeader>
                    <TableHeader>상태</TableHeader>
                    <TableHeader>목 각도</TableHeader>
                    <TableHeader>어깨 기울기</TableHeader>
                    <TableHeader>머리 전방 돌출</TableHeader>
                  </TableRow>
                </thead>
                <tbody>
                  {filteredHistory
                    .slice()
                    .reverse()
                    .map((record, index) => {
                      const status = getScoreStatus(record.score);
                      return (
                        <TableRow key={index}>
                          <TableCell>{formatDate(record.timestamp)}</TableCell>
                          <TableCell>{record.score}점</TableCell>
                          <TableCell color={status.color}>
                            {status.text}
                          </TableCell>
                          <TableCell>{record.neckAngle}°</TableCell>
                          <TableCell>{record.shoulderSlope}°</TableCell>
                          <TableCell>{record.headForward}%</TableCell>
                        </TableRow>
                      );
                    })}
                </tbody>
              </HistoryTable>
            ) : (
              <EmptyState>
                <p>선택한 기간에 자세 데이터가 없습니다.</p>
              </EmptyState>
            )}
          </ChartContainer>
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
