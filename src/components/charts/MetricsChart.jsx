import React from "react";
import MetricsTooltip from "./MetricsTooltip";

const MetricsChart = ({ data, rechartsComponents }) => {
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

  return (
    <div style={{ height: "300px", marginBottom: "24px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
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
  );
};

export default MetricsChart;
