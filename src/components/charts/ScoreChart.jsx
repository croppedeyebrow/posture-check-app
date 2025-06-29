import React from "react";
import CustomTooltip from "./CustomTooltip";

const ScoreChart = ({ data, rechartsComponents }) => {
  if (!rechartsComponents) return null;

  const {
    ResponsiveContainer,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Area,
  } = rechartsComponents;

  return (
    <div style={{ height: "300px", marginBottom: "24px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
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
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}점`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#1890ff"
            strokeWidth={2}
            fill="url(#colorGradient)"
            fillOpacity={0.3}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1890ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChart;
