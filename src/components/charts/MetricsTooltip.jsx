import React from "react";

const MetricsTooltip = ({ active, payload }) => {
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
        {payload.map((entry, index) => {
          let unit = "°";
          if (entry.dataKey === "headForward") {
            unit = "%";
          } else if (
            entry.dataKey === "forwardHeadDistance" ||
            entry.dataKey === "shoulderForwardMovement"
          ) {
            unit = "mm";
          }
          return (
            <p key={index} style={{ margin: "2px 0", color: "#888" }}>
              {entry.name}:{" "}
              <span style={{ color: entry.color, fontWeight: "bold" }}>
                {entry.value}
                {unit}
              </span>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export default MetricsTooltip;
