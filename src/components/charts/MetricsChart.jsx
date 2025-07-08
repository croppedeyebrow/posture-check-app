import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import MetricsTooltip from "./MetricsTooltip";
import CustomDatePicker from "../common/CustomDatePicker";

const MetricsChart = ({ data, rechartsComponents }) => {
  const { t, i18n } = useTranslation();
  const [selectedLines, setSelectedLines] = useState([]);
  // 날짜 필터 상태
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // 지표 라벨 useMemo로 관리 (언어 변경 시 갱신)
  const METRIC_LINES = useMemo(
    () => [
      {
        key: "neckAngle",
        name: t("detection.metrics.neckAngle"),
        color: "#FF6B6B",
      },
      {
        key: "shoulderSlope",
        name: t("detection.metrics.shoulderSlope"),
        color: "#4ECDC4",
      },
      {
        key: "headForward",
        name: t("detection.metrics.headForward"),
        color: "#45B7D1",
      },
      {
        key: "cervicalLordosis",
        name: t("data.export.cervicalLordosis"),
        color: "#FFA500",
      },
      {
        key: "headTilt",
        name: t("data.export.headTilt"),
        color: "#9B59B6",
      },
      {
        key: "headRotation",
        name: t("data.export.headRotation"),
        color: "#E74C3C",
      },
    ],
    [t, i18n.language]
  );

  // 최초 마운트 시 전체 선택
  React.useEffect(() => {
    setSelectedLines(METRIC_LINES.map((line) => line.key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  if (!rechartsComponents) return null;

  const {
    ResponsiveContainer,
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Line,
  } = rechartsComponents;

  const handleToggle = (key) => {
    setSelectedLines((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // 날짜 필터링
  const filteredData = data.filter((item) => {
    const t = item.timestamp || new Date(item.dateTime).getTime();
    const afterStart = !startDate || t >= new Date(startDate).getTime();
    const beforeEnd =
      !endDate || t <= new Date(endDate).setHours(23, 59, 59, 999);
    return afterStart && beforeEnd;
  });

  return (
    <div style={{ height: "370px", marginBottom: "24px" }}>
      {/* 날짜 선택 달력 */}
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
          placeholder={t("date.start")}
        />
        <span>~</span>
        <CustomDatePicker
          value={endDate}
          onChange={setEndDate}
          placeholder={t("date.end")}
        />
      </div>
      {/* 지표 선택 토글 버튼 */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 8, flexWrap: "wrap" }}
      >
        {METRIC_LINES.map((line) => (
          <label
            key={line.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontWeight: 500,
            }}
          >
            <input
              type="checkbox"
              checked={selectedLines.includes(line.key)}
              onChange={() => handleToggle(line.key)}
              style={{ accentColor: line.color }}
            />
            <span style={{ color: line.color }}>{line.name}</span>
          </label>
        ))}
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={filteredData}>
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
          {METRIC_LINES.filter((line) => selectedLines.includes(line.key)).map(
            (line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            )
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricsChart;
