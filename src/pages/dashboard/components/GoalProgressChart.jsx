import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const GoalProgressChart = () => {
  const monthlyData = [
    { month: 'Jan', completed: 8, inProgress: 5, planned: 2 },
    { month: 'Feb', completed: 12, inProgress: 7, planned: 3 },
    { month: 'Mar', completed: 15, inProgress: 8, planned: 4 },
    { month: 'Apr', completed: 18, inProgress: 6, planned: 2 },
    { month: 'May', completed: 22, inProgress: 9, planned: 5 },
    { month: 'Jun', completed: 25, inProgress: 7, planned: 3 }
  ];

  const goalStatusData = [
    { name: 'Completed', value: 25, color: 'var(--color-success)' },
    { name: 'In Progress', value: 7, color: 'var(--color-primary)' },
    { name: 'At Risk', value: 3, color: 'var(--color-warning)' },
    { name: 'Planned', value: 5, color: 'var(--color-secondary)' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border rounded-lg shadow-medium p-3">
          <p className="text-sm font-medium text-text-primary mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-text-secondary">
              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-surface border border-border rounded-lg shadow-medium p-3">
          <p className="text-sm font-medium text-text-primary">
            {data.name}: {data.value} goals
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Goal Progress Overview
        </h2>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-md hover:bg-background transition-colors duration-200">
            <Icon name="Download" size={16} className="text-text-secondary" />
          </button>
          <button className="p-2 rounded-md hover:bg-background transition-colors duration-200">
            <Icon name="MoreHorizontal" size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Progress Bar Chart */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">
            Monthly Goal Progress
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" stackId="a" fill="var(--color-success)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="inProgress" stackId="a" fill="var(--color-primary)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="planned" stackId="a" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span className="text-sm text-text-secondary">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-sm text-text-secondary">In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <span className="text-sm text-text-secondary">Planned</span>
            </div>
          </div>
        </div>

        {/* Goal Status Pie Chart */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">
            Current Goal Status
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={goalStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {goalStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Status Legend */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {goalStatusData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-text-secondary">{item.name}</span>
                <span className="text-sm font-medium text-text-primary ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalProgressChart;