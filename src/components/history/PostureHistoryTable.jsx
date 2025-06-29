import React from "react";
import {
  HistoryTable,
  TableHeader,
  TableRow,
  TableCell,
  PaginationContainer,
  PaginationInfo,
  PaginationButtons,
  PaginationButton,
  PaginationEllipsis,
  EmptyState,
} from "../../styles/PostureData.styles";

const PostureHistoryTable = ({
  filteredHistory,
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  currentData,
  handlePageChange,
  getScoreStatus,
  formatDate,
}) => {
  if (filteredHistory.length === 0) {
    return (
      <EmptyState>
        <p>선택한 기간에 자세 데이터가 없습니다.</p>
      </EmptyState>
    );
  }

  return (
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
                  <TableCell>{formatDate(record.timestamp)}</TableCell>
                  <TableCell>{record.score}점</TableCell>
                  <TableCell color={status.color}>{status.text}</TableCell>
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
            {startIndex + 1}-{Math.min(endIndex, filteredHistory.length)} /{" "}
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
  );
};

export default PostureHistoryTable;
