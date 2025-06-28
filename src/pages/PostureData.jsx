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
  PaginationContainer,
  PaginationInfo,
  PaginationButtons,
  PaginationButton,
  PaginationEllipsis,
  HistoryHeader,
  ToggleButton,
} from "../styles/PostureData.styles";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PostureData = () => {
  const [postureHistory, setPostureHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all"); // all, today, week, month
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);

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
    const goodPostureCount = data.filter((record) => record.score >= 60).length;
    const poorPostureCount = data.filter((record) => record.score < 50).length;
    const excellentCount = data.filter((record) => record.score >= 90).length;
    const normalPostureCount = data.filter(
      (record) => record.score >= 50 && record.score < 60
    ).length;

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
      normalPostureCount,
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
      setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋

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

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredHistory.slice(startIndex, endIndex);

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 그래프 데이터 준비
  const prepareChartData = useCallback((data) => {
    if (data.length === 0) return [];

    // 최근 50개 데이터만 사용 (그래프가 너무 복잡해지지 않도록)
    const recentData = data.slice(-50);

    return recentData.map((record, index) => ({
      index: index + 1,
      score: record.score,
      timestamp: record.timestamp,
      date: new Date(record.timestamp).toLocaleDateString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      dateTime: new Date(record.timestamp).toLocaleString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  }, []);

  // 자세 분포 파이차트 데이터 준비
  const preparePieChartData = useCallback((data) => {
    if (data.length === 0) return [];

    const postureCounts = {
      perfect: 0,
      good: 0,
      average: 0,
      poor: 0,
    };

    data.forEach((record) => {
      if (record.score >= 90) postureCounts.perfect++;
      else if (record.score >= 60) postureCounts.good++;
      else if (record.score >= 50) postureCounts.average++;
      else postureCounts.poor++;
    });

    return [
      { name: "완벽한 자세", value: postureCounts.perfect, color: "#2196F3" },
      { name: "좋은 자세", value: postureCounts.good, color: "#4CAF50" },
      { name: "보통 자세", value: postureCounts.average, color: "#FF9800" },
      { name: "나쁜 자세", value: postureCounts.poor, color: "#F44336" },
    ].filter((item) => item.value > 0);
  }, []);

  // 자세 지표 선그래프 데이터 준비
  const prepareMetricsChartData = useCallback((data) => {
    if (data.length === 0) return [];

    // 최근 30개 데이터만 사용 (지표 그래프는 더 적게)
    const recentData = data.slice(-30);

    return recentData.map((record, index) => ({
      index: index + 1,
      neckAngle: Math.abs(parseFloat(record.neckAngle)),
      shoulderSlope: Math.abs(parseFloat(record.shoulderSlope)),
      headForward: parseFloat(record.headForward),
      // 새로운 지표들 추가
      cervicalLordosis: parseFloat(record.cervicalLordosis || 0),
      forwardHeadDistance: parseFloat(record.forwardHeadDistance || 0),
      leftLateralBending: Math.abs(parseFloat(record.leftLateralBending || 0)),
      leftRotation: Math.abs(parseFloat(record.leftRotation || 0)),
      shoulderForwardMovement: parseFloat(record.shoulderForwardMovement || 0),
      timestamp: record.timestamp,
      date: new Date(record.timestamp).toLocaleDateString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      dateTime: new Date(record.timestamp).toLocaleString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  }, []);

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>
            {payload[0].payload.dateTime}
          </p>
          <p style={{ margin: "0", color: "#888" }}>
            점수:{" "}
            <span style={{ color: "#1890ff", fontWeight: "bold" }}>
              {payload[0].value}점
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // 자세 지표 툴팁 컴포넌트
  const MetricsTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>
            {payload[0].payload.dateTime}
          </p>
          {payload.map((entry, index) => {
            let unit = "°";
            if (entry.dataKey === "headForward") {
              unit = "%";
            } else if (
              entry.dataKey === "forwardHeadDistance" ||
              entry.dataKey === "shoulderForwardMovement"
            ) {
              unit = "mm";
            }
            return (
              <p key={index} style={{ margin: "2px 0", color: "#888" }}>
                {entry.name}:{" "}
                <span style={{ color: entry.color, fontWeight: "bold" }}>
                  {entry.value}
                  {unit}
                </span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

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
            {filteredHistory.length > 0 && (
              <div style={{ height: "300px", marginBottom: "24px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={prepareChartData(filteredHistory)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="dateTime"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}점`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#1890ff"
                      strokeWidth={2}
                      fill="url(#colorGradient)"
                      fillOpacity={0.3}
                    />
                    <defs>
                      <linearGradient
                        id="colorGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#1890ff"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#1890ff"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <HistoryHeader>
              <h3>자세 분포 분석</h3>
            </HistoryHeader>
            {filteredHistory.length > 0 && (
              <div style={{ height: "300px", marginBottom: "24px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={preparePieChartData(filteredHistory)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {preparePieChartData(filteredHistory).map(
                        (entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <HistoryHeader>
              <h3>자세 지표 변화</h3>
            </HistoryHeader>
            {filteredHistory.length > 0 && (
              <div style={{ height: "300px", marginBottom: "24px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareMetricsChartData(filteredHistory)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="dateTime"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}°`}
                    />
                    <Tooltip content={<MetricsTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="neckAngle"
                      name="목 각도"
                      stroke="#FF6B6B"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="shoulderSlope"
                      name="어깨 기울기"
                      stroke="#4ECDC4"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="headForward"
                      name="머리 전방 돌출도"
                      stroke="#45B7D1"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cervicalLordosis"
                      name="목 전만각"
                      stroke="#FFA500"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="leftLateralBending"
                      name="좌측 측굴 각도"
                      stroke="#9B59B6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="leftRotation"
                      name="좌측 회전 각도"
                      stroke="#E74C3C"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <HistoryHeader>
              <h3>자세 기록 히스토리</h3>
              <ToggleButton
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                expanded={isHistoryExpanded}
              >
                {isHistoryExpanded ? "▼" : "▶"}
              </ToggleButton>
            </HistoryHeader>
            {isHistoryExpanded && filteredHistory.length > 0 && (
              <>
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
                    {currentData
                      .slice()
                      .reverse()
                      .map((record, index) => {
                        const status = getScoreStatus(record.score);
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              {formatDate(record.timestamp)}
                            </TableCell>
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

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <PaginationContainer>
                    <PaginationInfo>
                      {startIndex + 1}-
                      {Math.min(endIndex, filteredHistory.length)} /{" "}
                      {filteredHistory.length}개
                    </PaginationInfo>
                    <PaginationButtons>
                      <PaginationButton
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        이전
                      </PaginationButton>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          // 현재 페이지 주변 5개 페이지만 표시
                          return (
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 2
                          );
                        })
                        .map((page, index, array) => {
                          // 건너뛴 페이지가 있으면 "..." 표시
                          if (index > 0 && page - array[index - 1] > 1) {
                            return (
                              <React.Fragment key={`ellipsis-${page}`}>
                                <PaginationEllipsis>...</PaginationEllipsis>
                                <PaginationButton
                                  onClick={() => handlePageChange(page)}
                                  active={currentPage === page}
                                >
                                  {page}
                                </PaginationButton>
                              </React.Fragment>
                            );
                          }
                          return (
                            <PaginationButton
                              key={page}
                              onClick={() => handlePageChange(page)}
                              active={currentPage === page}
                            >
                              {page}
                            </PaginationButton>
                          );
                        })}

                      <PaginationButton
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        다음
                      </PaginationButton>
                    </PaginationButtons>
                  </PaginationContainer>
                )}
              </>
            )}
            {isHistoryExpanded && filteredHistory.length === 0 && (
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
