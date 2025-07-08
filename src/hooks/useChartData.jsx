import { useCallback } from "react";

const useChartData = () => {
  // 점수 변화 그래프 데이터 준비
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
  const preparePieChartData = useCallback((data, t, language) => {
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
      {
        name: t("완벽한 자세"),
        value: postureCounts.perfect,
        color: "#2196F3",
      },
      {
        name: t("detection.posture.good"),
        value: postureCounts.good,
        color: "#4CAF50",
      },
      {
        name: t("detection.posture.normal"),
        value: postureCounts.average,
        color: "#FF9800",
      },
      {
        name: t("detection.posture.bad"),
        value: postureCounts.poor,
        color: "#F44336",
      },
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
      headTilt: Math.abs(parseFloat(record.headTilt || 0)),
      headRotation: Math.abs(parseFloat(record.headRotation || 0)),
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

  return {
    prepareChartData,
    preparePieChartData,
    prepareMetricsChartData,
  };
};

export default useChartData;
