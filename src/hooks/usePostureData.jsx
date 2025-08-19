import { useState, useEffect, useCallback } from "react";
import { postureApi } from "../api/postureApi";
import { authApi } from "../api/authApi";

const usePostureData = () => {
  const [postureHistory, setPostureHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 자세 히스토리 로드
  const loadPostureHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 인증 상태 확인
      const authStatus = authApi.checkAuthStatus();
      if (!authStatus.isAuthenticated) {
        throw new Error("로그인이 필요합니다.");
      }

      // API에서 자세 데이터 조회 (postureApi에서 자동으로 현재 사용자 ID 사용)
      const response = await postureApi.getPostureHistory();

      // 백엔드 응답 형식에 맞게 데이터 변환
      const rawHistory = response.data || response || [];

      // 백엔드 데이터를 프론트엔드 형식으로 변환
      const history = rawHistory.map((item) => ({
        id: item.id,
        timestamp: new Date(item.created_at || item.timestamp).getTime(),
        score: item.score || 0,
        neckAngle: item.neck_angle || item.neckAngle || 0,
        shoulderSlope: item.shoulder_slope || item.shoulderSlope || 0,
        headForward: item.head_forward || item.headForward || 0,
        shoulderHeightDiff:
          item.shoulder_height_diff || item.shoulderHeightDiff || 0,
        cervicalLordosis: item.cervical_lordosis || item.cervicalLordosis || 0,
        forwardHeadDistance:
          item.forward_head_distance || item.forwardHeadDistance || 0,
        headTilt: item.head_tilt || item.headTilt || 0,
        shoulderForwardMovement:
          item.shoulder_forward_movement || item.shoulderForwardMovement || 0,
        headRotation: item.head_rotation || item.headRotation || 0,
        issues: item.issues || [],
        sessionId: item.session_id || item.sessionId || "",
        deviceInfo: item.device_info || item.deviceInfo || "",
      }));

      setPostureHistory(history);
      setFilteredHistory(history);
    } catch (err) {
      console.error("자세 데이터 로드 실패:", err);
      setError(err.message || "데이터를 불러오는데 실패했습니다.");
      // 에러 발생 시 빈 배열로 설정
      setPostureHistory([]);
      setFilteredHistory([]);
    } finally {
      setLoading(false);
    }
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
  const clearData = useCallback(async () => {
    if (
      window.confirm(
        "모든 자세 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      try {
        // 인증 상태 확인
        const authStatus = authApi.checkAuthStatus();
        if (!authStatus.isAuthenticated) {
          throw new Error("로그인이 필요합니다.");
        }

        // API를 통해 모든 데이터 삭제 (백엔드에서 bulk delete 구현 필요)
        // 현재는 프론트엔드에서만 초기화
        setPostureHistory([]);
        setFilteredHistory([]);
        setStats(null);

        console.log("자세 데이터가 초기화되었습니다.");
      } catch (err) {
        console.error("데이터 초기화 실패:", err);
        setError(err.message || "데이터 초기화에 실패했습니다.");
      }
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
    loading,
    error,
    loadPostureHistory,
    applyTimeFilter,
    clearData,
  };
};

export default usePostureData;
