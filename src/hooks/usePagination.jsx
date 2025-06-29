import { useState, useMemo } from "react";

const usePagination = (data, itemsPerPage = 20) => {
  const [currentPage, setCurrentPage] = useState(1);

  // 페이지네이션 계산
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    return {
      totalPages,
      startIndex,
      endIndex,
      currentData,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }, [data, currentPage, itemsPerPage]);

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 첫 페이지로 이동
  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  // 마지막 페이지로 이동
  const goToLastPage = () => {
    setCurrentPage(paginationData.totalPages);
  };

  // 다음 페이지로 이동
  const goToNextPage = () => {
    if (paginationData.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 이전 페이지로 이동
  const goToPrevPage = () => {
    if (paginationData.hasPrevPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 페이지 리셋 (필터 변경 시 사용)
  const resetPage = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    ...paginationData,
    handlePageChange,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPrevPage,
    resetPage,
  };
};

export default usePagination;
