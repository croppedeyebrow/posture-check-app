import { useState, useEffect, useCallback } from "react";

const usePostureData = () => {
  const [postureHistory, setPostureHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all");

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

  // 컴포넌트 마운트 시 히스토리 로드
  useEffect(() => {
    loadPostureHistory();
  }, [loadPostureHistory]);

  // 필터링된 데이터가 변경될 때 통계 재계산
  useEffect(() => {
    calculateStats(filteredHistory);
  }, [filteredHistory, calculateStats]);

  return {
    postureHistory,
    filteredHistory,
    stats,
    timeFilter,
    loadPostureHistory,
    applyTimeFilter,
    clearData,
  };
};

export default usePostureData;
