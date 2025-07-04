import styled from "styled-components";

export const DatePickerWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const DateInput = styled.input`
  width: 160px;
  height: 44px;
  font-size: 1.1rem;
  border-radius: 8px;
  border: 1.5px solid #bbb;
  text-align: center;
  cursor: pointer;
`;

export const CalendarPopper = styled.div`
  position: absolute;
  top: 50px;
  left: 0;
  z-index: 20;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 16px;
`;
