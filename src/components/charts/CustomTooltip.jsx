import React from "react";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>
          {payload[0].payload.dateTime}
        </p>
        <p style={{ margin: "0", color: "#888" }}>
          점수:{" "}
          <span style={{ color: "#1890ff", fontWeight: "bold" }}>
            {payload[0].value}점
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
