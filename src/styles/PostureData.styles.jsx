import styled from "styled-components";

export const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  padding-top: 6rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};

  h1 {
    margin: 0;
    color: ${({ theme }) => theme.colors.text};
    font-size: 2rem;
    font-weight: bold;
  }

  div {
    display: flex;
    gap: 1rem;
  }
`;

export const FilterContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border: 2px solid
    ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primary : theme.colors.border};
  border-radius: 6px;
  background: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : "transparent"};
  color: ${({ theme, $isActive }) => ($isActive ? "white" : theme.colors.text)};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primaryDark : theme.colors.background};
    transform: translateY(-1px);
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

export const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid
    ${({ theme, $isGood, $postureType }) => {
      if ($postureType === "excellent") return "#2196F3"; // 완벽한 자세 - blue
      if ($postureType === "good") return "#4CAF50"; // 좋은 자세 - green
      if ($postureType === "average") return "#FF9800"; // 보통 자세 - orange
      if ($postureType === "poor") return "#F44336"; // 나쁜 자세 - red
      return $isGood ? theme.colors.success : theme.colors.error;
    }};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

export const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

export const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

export const ChartContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const DataHistoryContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const HistoryTable = styled.table`
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const HistoryTableScroll = styled.div`
  overflow-x: auto;
  width: 100%;
  max-width: 100%;
`;

export const TableHeader = styled.th`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1.3;
  white-space: pre-line;
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const TableCell = styled.td`
  padding: 1rem;
  color: ${({ theme, color }) => {
    if (color === "excellent") return "#2196F3";
    if (color === "good") return "#4CAF50";
    if (color === "average") return "#FF9800";
    if (color === "poor") return "#F44336";
    return theme.colors.text;
  }};
  font-weight: ${({ color }) => (color ? "600" : "400")};
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    margin: 0;
    font-size: 1rem;
  }
`;

export const ExportButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.success};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #45a049;
    transform: translateY(-1px);
  }
`;

export const ExcelExportButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

export const ClearButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.error};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #d32f2f;
    transform: translateY(-1px);
  }
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const PaginationInfo = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  font-weight: 500;
`;

export const PaginationButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

export const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  border: 2px solid
    ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primary : theme.colors.border};
  border-radius: 6px;
  background: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : "transparent"};
  color: ${({ theme, $isActive, disabled }) =>
    disabled
      ? theme.colors.textSecondary
      : $isActive
      ? "white"
      : theme.colors.text};
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  min-width: 40px;

  &:hover:not(:disabled) {
    background: ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primaryDark : theme.colors.background};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
  }
`;

export const PaginationEllipsis = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
  padding: 0 0.5rem;
`;

export const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h3 {
    margin: 0;
    color: ${({ theme }) => theme.colors.text};
    font-size: 1.5rem;
    font-weight: bold;
  }
`;

export const ToggleButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  transform: ${({ expanded }) => (expanded ? "rotate(0deg)" : "rotate(0deg)")};

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    transform: scale(1.1);
  }
`;

export const HeaderMultiline = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15em;
  span {
    font-size: 1em;
    font-weight: 400;
  }
`;
