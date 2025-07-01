import React, { useState } from "react";
import MetricsTooltip from "./MetricsTooltip";
import DateRangePicker from "../common/DateRangePicker";

const METRIC_LINES = [
  {
    key: "neckAngle",
    name: "목 각도",
    color: "#FF6B6B",
  },
  {
    key: "shoulderSlope",
    name: "어깨 기울기",
    color: "#4ECDC4",
  },
  {
    key: "headForward",
    name: "머리 전방 돌출도",
    color: "#45B7D1",
  },
  {
    key: "cervicalLordosis",
    name: "목 전만각",
    color: "#FFA500",
  },
  {
    key: "headTilt",
    name: "머리 좌우 기울기",
    color: "#9B59B6",
  },
  {
    key: "headRotation",
    name: "머리 좌우 회전",
    color: "#E74C3C",
  },
];

const MetricsChart = ({ data, rechartsComponents }) => {
  const [selectedLines, setSelectedLines] = useState(
    METRIC_LINES.map((line) => line.key)
  );
  // 날짜 필터 상태
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

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
    const afterStart = !startDate || t >= startDate.getTime();
    const beforeEnd = !endDate || t <= endDate.setHours(23, 59, 59, 999);
    return afterStart && beforeEnd;
  });

  return (
    <div style={{ height: "370px", marginBottom: "24px" }}>
      {/* 날짜 선택 달력 */}
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={({ startDate, endDate }) => {
          setStartDate(startDate);
          setEndDate(endDate);
        }}
      />
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
