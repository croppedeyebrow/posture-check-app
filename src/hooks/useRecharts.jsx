import { useState, useEffect, useCallback } from "react";

const useRecharts = () => {
  const [rechartsLoaded, setRechartsLoaded] = useState(false);
  const [rechartsComponents, setRechartsComponents] = useState(null);
  const [error, setError] = useState(null);

  // Recharts 라이브러리를 동적으로 로드
  const loadRecharts = useCallback(async () => {
    try {
      setError(null);
      const recharts = await import("recharts");
      setRechartsComponents(recharts);
      setRechartsLoaded(true);
      return recharts;
    } catch (error) {
      console.error("Recharts 라이브러리 로드 실패:", error);
      setError(error);
      throw error;
    }
  }, []);

  // 컴포넌트 마운트 시 Recharts 로드
  useEffect(() => {
    loadRecharts();
  }, [loadRecharts]);

  return {
    rechartsLoaded,
    rechartsComponents,
    error,
    loadRecharts,
  };
};

export default useRecharts;
