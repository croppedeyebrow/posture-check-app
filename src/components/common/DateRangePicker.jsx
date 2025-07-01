import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
  label = "기간",
  style,
  className,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
        flexWrap: "wrap",
        ...style,
      }}
      className={className}
    >
      {label && <span style={{ fontWeight: 500 }}>{label}:</span>}
      <DatePicker
        selected={startDate}
        onChange={(date) => onChange({ startDate: date, endDate })}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        dateFormat="yyyy.MM.dd"
        placeholderText="시작일 선택"
        maxDate={endDate || undefined}
        isClearable
      />
      <span>~</span>
      <DatePicker
        selected={endDate}
        onChange={(date) => onChange({ startDate, endDate: date })}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        dateFormat="yyyy.MM.dd"
        placeholderText="종료일 선택"
        minDate={startDate || undefined}
        isClearable
      />
    </div>
  );
};

export default DateRangePicker;
