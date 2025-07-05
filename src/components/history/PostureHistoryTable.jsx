import React from "react";
import { useTranslation } from "react-i18next";
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
  HeaderMultiline,
  HistoryTableScroll,
} from "../../styles/PostureData.styles";

const PostureHistoryTable = ({
  data,
  currentPage,
  totalPages,
  onPageChange,
  getScoreStatus,
  formatDate,
}) => {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <EmptyState>
        <p>{t("data.export.noData")}</p>
      </EmptyState>
    );
  }

  return (
    <>
      <HistoryTableScroll>
        <HistoryTable>
          <thead>
            <TableRow>
              <TableHeader style={{ minWidth: "80px", whiteSpace: "nowrap" }}>
                {t("data.export.dateTime")}
              </TableHeader>
              <TableHeader style={{ minWidth: "60px", whiteSpace: "nowrap" }}>
                {t("detection.metrics.score")}
              </TableHeader>
              <TableHeader style={{ minWidth: "60px", whiteSpace: "nowrap" }}>
                {t("data.export.status")}
              </TableHeader>
              <TableHeader>{t("detection.metrics.headForward")}</TableHeader>
              <TableHeader style={{ minWidth: "90px" }}>
                <HeaderMultiline>{t("data.export.headTilt")}</HeaderMultiline>
              </TableHeader>
              <TableHeader style={{ minWidth: "90px" }}>
                <HeaderMultiline>
                  {t("data.export.headRotation")}
                </HeaderMultiline>
              </TableHeader>
              <TableHeader>{t("detection.metrics.neckAngle")}</TableHeader>
              <TableHeader style={{ minWidth: "90px" }}>
                {t("data.export.cervicalLordosis")}
              </TableHeader>
              <TableHeader>{t("detection.metrics.shoulderSlope")}</TableHeader>
              <TableHeader style={{ minWidth: "90px" }}>
                {t("data.export.shoulderForwardMovement")}
              </TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {data
              .slice()
              .reverse()
              .map((record, index) => {
                const status = getScoreStatus(record.score);
                return (
                  <TableRow key={index}>
                    <TableCell>{formatDate(record.timestamp)}</TableCell>
                    <TableCell style={{ whiteSpace: "nowrap" }}>
                      {record.score}
                      {t("data.export.points")}
                    </TableCell>
                    <TableCell
                      style={{ whiteSpace: "nowrap" }}
                      color={status.color}
                    >
                      {status.text}
                    </TableCell>
                    <TableCell>{record.headForward}%</TableCell>
                    <TableCell>{record.headTilt}°</TableCell>
                    <TableCell>{record.headRotation}°</TableCell>
                    <TableCell>{record.neckAngle}°</TableCell>
                    <TableCell>{record.cervicalLordosis}°</TableCell>
                    <TableCell>{record.shoulderSlope}°</TableCell>
                    <TableCell>{record.shoulderForwardMovement}mm</TableCell>
                  </TableRow>
                );
              })}
          </tbody>
        </HistoryTable>
      </HistoryTableScroll>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <PaginationContainer>
          <PaginationInfo>
            {(currentPage - 1) * 20 + 1}-
            {Math.min(currentPage * 20, data.length)} / {data.length}
            {t("data.export.records")}
          </PaginationInfo>
          <PaginationButtons>
            <PaginationButton
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {t("pagination.previous")}
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
                        onClick={() => onPageChange(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationButton>
                    </React.Fragment>
                  );
                }
                return (
                  <PaginationButton
                    key={page}
                    onClick={() => onPageChange(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationButton>
                );
              })}

            <PaginationButton
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {t("pagination.next")}
            </PaginationButton>
          </PaginationButtons>
        </PaginationContainer>
      )}
    </>
  );
};

export default PostureHistoryTable;
