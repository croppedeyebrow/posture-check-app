import React, { useState } from "react";

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

const CustomCalendar = ({ selected, onSelect }) => {
  const today = new Date();
  const [current, setCurrent] = useState(
    selected ? new Date(selected) : new Date()
  );

  const year = current.getFullYear();
  const month = current.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  // 달력 6주(6행) 배열 생성
  const calendar = [];
  let day = 1 - firstDay;
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++, day++) {
      if (day < 1 || day > daysInMonth) {
        week.push(null);
      } else {
        week.push(new Date(year, month, day));
      }
    }
    calendar.push(week);
  }

  return (
    <div style={{ width: 320, userSelect: "none" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <button onClick={() => setCurrent(new Date(year, month - 1, 1))}>
          &lt;
        </button>
        <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>
          {year}년 {month + 1}월
        </span>
        <button onClick={() => setCurrent(new Date(year, month + 1, 1))}>
          &gt;
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          marginBottom: 4,
        }}
      >
        {WEEK_DAYS.map((d) => (
          <div
            key={d}
            style={{ textAlign: "center", fontWeight: 500, color: "#1976d2" }}
          >
            {d}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 2,
        }}
      >
        {calendar.flat().map((date, idx) => {
          if (!date) return <div key={idx} />;
          const isToday = formatDate(date) === formatDate(today);
          const isSelected = formatDate(date) === formatDate(selected);
          return (
            <button
              key={idx}
              onClick={() => onSelect(formatDate(date))}
              style={{
                width: "100%",
                aspectRatio: "1/1",
                border: isSelected ? "2px solid #1976d2" : "1px solid #ddd",
                background: isSelected
                  ? "#1976d2"
                  : isToday
                  ? "#e3f2fd"
                  : "#fff",
                color: isSelected ? "#fff" : "#222",
                borderRadius: 8,
                fontWeight: isToday ? 600 : 400,
                fontSize: "1rem",
                cursor: "pointer",
                outline: "none",
                transition: "all 0.15s",
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCalendar;
