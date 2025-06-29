import React from "react";

const PosturePieChart = ({ data, rechartsComponents }) => {
  if (!rechartsComponents) return null;

  const { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } =
    rechartsComponents;

  return (
    <div style={{ height: "300px", marginBottom: "24px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PosturePieChart;
