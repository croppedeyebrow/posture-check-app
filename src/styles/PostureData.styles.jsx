import styled from "styled-components";

export const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
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
    ${({ theme, active }) =>
      active ? theme.colors.primary : theme.colors.border};
  border-radius: 6px;
  background: ${({ theme, active }) =>
    active ? theme.colors.primary : "transparent"};
  color: ${({ theme, active }) => (active ? "white" : theme.colors.text)};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, active }) =>
      active ? theme.colors.primaryDark : theme.colors.background};
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
    ${({ theme, isGood }) =>
      isGood ? theme.colors.success : theme.colors.error};
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
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0 0 1.5rem 0;
    color: ${({ theme }) => theme.colors.text};
    font-size: 1.5rem;
    font-weight: bold;
  }
`;

export const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const TableHeader = styled.th`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
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
    if (color === "excellent") return "#4CAF50";
    if (color === "good") return "#2196F3";
    if (color === "average") return "#FF9800";
    if (color === "warning") return "#FFC107";
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
