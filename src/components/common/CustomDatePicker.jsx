import React, { useState, useRef, useEffect } from "react";
import CustomCalendar from "./CustomCalendar";
import {
  DatePickerWrapper,
  DateInput,
  CalendarPopper,
} from "../../styles/CustomDatePicker.styles";

const CustomDatePicker = ({ value, onChange, placeholder = "날짜 선택" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // 외부 클릭 시 닫힘 처리
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <DatePickerWrapper ref={ref}>
      <DateInput
        value={value ? value : ""}
        placeholder={placeholder}
        readOnly
        onClick={() => setOpen(true)}
      />
      {open && (
        <CalendarPopper>
          <CustomCalendar
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
          />
        </CalendarPopper>
      )}
    </DatePickerWrapper>
  );
};

export default CustomDatePicker;
