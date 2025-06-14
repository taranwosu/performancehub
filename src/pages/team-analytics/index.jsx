import React, { useState, useMemo } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActions from '../../components/ui/QuickActions';
import Icon from '../../components/AppIcon';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TeamAnalytics = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('last-quarter');
  const [selectedDepartments, setSelectedDepartments] = useState(['all']);
  const [selectedTeams, setSelectedTeams] = useState(['all']);
  const [selectedMetrics, setSelectedMetrics] = useState(['goal-completion', 'performance-scores']);
  const [activeChart, setActiveChart] = useState('trends');

  // Mock data for analytics
  const kpiData = {
    goalCompletionRate: { value: 87, trend: 5.2, period: 'vs last quarter' },
    avgPerformanceScore: { value: 4.2, trend: 0.3, period: 'vs last quarter' },
    reviewCompletionRate: { value: 94, trend: -2.1, period: 'vs last quarter' },
    teamEngagement: { value: 78, trend: 8.5, period: 'vs last quarter' }
  };

  const performanceTrends = [
    { month: 'Jan', goalCompletion: 82, performanceScore: 3.8, engagement: 75 },
    { month: 'Feb', goalCompletion: 85, performanceScore: 4.0, engagement: 77 },
    { month: 'Mar', goalCompletion: 87, performanceScore: 4.2, engagement: 78 },
    { month: 'Apr', goalCompletion: 89, performanceScore: 4.1, engagement: 80 },
    { month: 'May', goalCompletion: 91, performanceScore: 4.3, engagement: 82 },
    { month: 'Jun', goalCompletion: 87, performanceScore: 4.2, engagement: 78 }
  ];

  const departmentComparison = [
    { department: 'Engineering', goalCompletion: 92, performanceScore: 4.4, teamSize: 45 },
    { department: 'Sales', goalCompletion: 88, performanceScore: 4.1, teamSize: 32 },
    { department: 'Marketing', goalCompletion: 85, performanceScore: 4.0, teamSize: 28 },
    { department: 'HR', goalCompletion: 90, performanceScore: 4.3, teamSize: 15 },
    { department: 'Finance', goalCompletion: 87, performanceScore: 4.2, teamSize: 18 }
  ];

  const goalDistribution = [
    { name: 'Completed', value: 65, color: '#059669' },
    { name: 'In Progress', value: 25, color: '#0EA5E9' },
    { name: 'At Risk', value: 7, color: '#D97706' },
    { name: 'Overdue', value: 3, color: '#DC2626' }
  ];

  const teamPerformanceHeatmap = [
    { team: 'Frontend Team', q1: 85, q2: 88, q3: 92, q4: 89 },
    { team: 'Backend Team', q1: 90, q2: 87, q3: 91, q4: 93 },
    { team: 'DevOps Team', q1: 82, q2: 85, q3: 88, q4: 86 },
    { team: 'QA Team', q1: 88, q2: 90, q3: 87, q4: 91 },
    { team: 'Design Team', q1: 86, q2: 89, q3: 85, q4: 88 }
  ];

  const filterOptions = {
    dateRanges: [
      { value: 'last-month', label: 'Last Month' },
      { value: 'last-quarter', label: 'Last Quarter' },
      { value: 'last-6-months', label: 'Last 6 Months' },
      { value: 'last-year', label: 'Last Year' },
      { value: 'custom', label: 'Custom Range' }
    ],
    departments: [
      { value: 'all', label: 'All Departments' },
      { value: 'engineering', label: 'Engineering' },
      { value: 'sales', label: 'Sales' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'hr', label: 'Human Resources' },
      { value: 'finance', label: 'Finance' }
    ],
    teams: [
      { value: 'all', label: 'All Teams' },
      { value: 'frontend', label: 'Frontend Team' },
      { value: 'backend', label: 'Backend Team' },
      { value: 'devops', label: 'DevOps Team' },
      { value: 'qa', label: 'QA Team' },
      { value: 'design', label: 'Design Team' }
    ],
    metrics: [
      { value: 'goal-completion', label: 'Goal Completion' },
      { value: 'performance-scores', label: 'Performance Scores' },
      { value: 'engagement', label: 'Team Engagement' },
      { value: 'review-completion', label: 'Review Completion' }
    ]
  };

  const getHeatmapColor = (value) => {
    if (value >= 90) return 'bg-success';
    if (value >= 80) return 'bg-accent';
    if (value >= 70) return 'bg-warning';
    return 'bg-error';
  };

  const handleExport = (format) => {
    console.log(`Exporting analytics data in ${format} format`);
    // Export functionality would be implemented here
  };

  const filteredData = useMemo(() => {
    // Filter logic would be applied here based on selected filters
    return {
      trends: performanceTrends,
      departments: departmentComparison,
      distribution: goalDistribution,
      heatmap: teamPerformanceHeatmap
    };
  }, [selectedDateRange, selectedDepartments, selectedTeams, selectedMetrics]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <Breadcrumb />
          
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Team Analytics</h1>
              <p className="text-text-secondary">
                Comprehensive performance insights and data visualization for informed decision making
              </p>
            </div>
            
            {/* Export Actions */}
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button
                onClick={() => handleExport('pdf')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Icon name="FileText" size={16} />
                <span>Export PDF</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="btn-primary flex items-center space-x-2"
              >
                <Icon name="Download" size={16} />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          <QuickActions />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                  <Icon name="Filter" size={20} className="mr-2" />
                  Filters
                </h3>

                {/* Date Range Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Date Range
                  </label>
                  <select
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                    className="form-input"
                  >
                    {filterOptions.dateRanges.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Departments
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {filterOptions.departments.map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedDepartments.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDepartments([...selectedDepartments, option.value]);
                            } else {
                              setSelectedDepartments(selectedDepartments.filter(d => d !== option.value));
                            }
                          }}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-text-secondary">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Teams Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Teams
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {filterOptions.teams.map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTeams.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTeams([...selectedTeams, option.value]);
                            } else {
                              setSelectedTeams(selectedTeams.filter(t => t !== option.value));
                            }
                          }}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-text-secondary">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Metrics Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Metrics
                  </label>
                  <div className="space-y-2">
                    {filterOptions.metrics.map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedMetrics.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMetrics([...selectedMetrics, option.value]);
                            } else {
                              setSelectedMetrics(selectedMetrics.filter(m => m !== option.value));
                            }
                          }}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-text-secondary">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button className="w-full btn-primary">
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon name="Target" size={24} className="text-primary" />
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      kpiData.goalCompletionRate.trend > 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    }`}>
                      {kpiData.goalCompletionRate.trend > 0 ? '+' : ''}{kpiData.goalCompletionRate.trend}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary">{kpiData.goalCompletionRate.value}%</h3>
                  <p className="text-sm text-text-secondary">Goal Completion Rate</p>
                  <p className="text-xs text-text-secondary mt-1">{kpiData.goalCompletionRate.period}</p>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon name="Star" size={24} className="text-warning" />
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      kpiData.avgPerformanceScore.trend > 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    }`}>
                      {kpiData.avgPerformanceScore.trend > 0 ? '+' : ''}{kpiData.avgPerformanceScore.trend}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary">{kpiData.avgPerformanceScore.value}/5</h3>
                  <p className="text-sm text-text-secondary">Avg Performance Score</p>
                  <p className="text-xs text-text-secondary mt-1">{kpiData.avgPerformanceScore.period}</p>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon name="FileCheck" size={24} className="text-success" />
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      kpiData.reviewCompletionRate.trend > 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    }`}>
                      {kpiData.reviewCompletionRate.trend > 0 ? '+' : ''}{kpiData.reviewCompletionRate.trend}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary">{kpiData.reviewCompletionRate.value}%</h3>
                  <p className="text-sm text-text-secondary">Review Completion</p>
                  <p className="text-xs text-text-secondary mt-1">{kpiData.reviewCompletionRate.period}</p>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon name="Heart" size={24} className="text-accent" />
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      kpiData.teamEngagement.trend > 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    }`}>
                      {kpiData.teamEngagement.trend > 0 ? '+' : ''}{kpiData.teamEngagement.trend}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary">{kpiData.teamEngagement.value}%</h3>
                  <p className="text-sm text-text-secondary">Team Engagement</p>
                  <p className="text-xs text-text-secondary mt-1">{kpiData.teamEngagement.period}</p>
                </div>
              </div>

              {/* Chart Navigation */}
              <div className="card p-6">
                <div className="flex flex-wrap items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-primary">Performance Analytics</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveChart('trends')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        activeChart === 'trends' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Trends
                    </button>
                    <button
                      onClick={() => setActiveChart('departments')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        activeChart === 'departments' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Departments
                    </button>
                    <button
                      onClick={() => setActiveChart('distribution')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        activeChart === 'distribution' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Distribution
                    </button>
                    <button
                      onClick={() => setActiveChart('heatmap')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        activeChart === 'heatmap' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Heatmap
                    </button>
                  </div>
                </div>

                {/* Performance Trends Chart */}
                {activeChart === 'trends' && (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={filteredData.trends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" stroke="#64748B" />
                        <YAxis stroke="#64748B" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#FFFFFF', 
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px'
                          }} 
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="goalCompletion" 
                          stroke="#2563EB" 
                          strokeWidth={2}
                          name="Goal Completion (%)"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="performanceScore" 
                          stroke="#059669" 
                          strokeWidth={2}
                          name="Performance Score"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="engagement" 
                          stroke="#0EA5E9" 
                          strokeWidth={2}
                          name="Engagement (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Department Comparison Chart */}
                {activeChart === 'departments' && (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filteredData.departments}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="department" stroke="#64748B" />
                        <YAxis stroke="#64748B" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#FFFFFF', 
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px'
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="goalCompletion" fill="#2563EB" name="Goal Completion (%)" />
                        <Bar dataKey="performanceScore" fill="#059669" name="Performance Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Goal Distribution Chart */}
                {activeChart === 'distribution' && (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={filteredData.distribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {filteredData.distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Team Performance Heatmap */}
                {activeChart === 'heatmap' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-2 text-center text-sm font-medium text-text-secondary">
                      <div></div>
                      <div>Q1</div>
                      <div>Q2</div>
                      <div>Q3</div>
                      <div>Q4</div>
                    </div>
                    {filteredData.heatmap.map((team, index) => (
                      <div key={index} className="grid grid-cols-5 gap-2 items-center">
                        <div className="text-sm font-medium text-text-primary pr-4">
                          {team.team}
                        </div>
                        <div className={`h-12 rounded-md flex items-center justify-center text-white font-medium ${getHeatmapColor(team.q1)}`}>
                          {team.q1}%
                        </div>
                        <div className={`h-12 rounded-md flex items-center justify-center text-white font-medium ${getHeatmapColor(team.q2)}`}>
                          {team.q2}%
                        </div>
                        <div className={`h-12 rounded-md flex items-center justify-center text-white font-medium ${getHeatmapColor(team.q3)}`}>
                          {team.q3}%
                        </div>
                        <div className={`h-12 rounded-md flex items-center justify-center text-white font-medium ${getHeatmapColor(team.q4)}`}>
                          {team.q4}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Detailed Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performers */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                    <Icon name="Trophy" size={20} className="mr-2 text-warning" />
                    Top Performing Teams
                  </h3>
                  <div className="space-y-3">
                    {departmentComparison
                      .sort((a, b) => b.goalCompletion - a.goalCompletion)
                      .slice(0, 3)
                      .map((dept, index) => (
                        <div key={dept.department} className="flex items-center justify-between p-3 bg-background rounded-md">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                              index === 0 ? 'bg-warning' : index === 1 ? 'bg-text-secondary' : 'bg-accent'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-text-primary">{dept.department}</p>
                              <p className="text-sm text-text-secondary">{dept.teamSize} members</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-text-primary">{dept.goalCompletion}%</p>
                            <p className="text-sm text-text-secondary">completion</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Performance Insights */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                    <Icon name="TrendingUp" size={20} className="mr-2 text-success" />
                    Key Insights
                  </h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-success/10 rounded-md border border-success/20">
                      <div className="flex items-start space-x-2">
                        <Icon name="CheckCircle" size={16} className="text-success mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-success">Strong Performance Trend</p>
                          <p className="text-xs text-success/80">Goal completion rates have improved by 5.2% this quarter</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-warning/10 rounded-md border border-warning/20">
                      <div className="flex items-start space-x-2">
                        <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-warning">Review Completion Lag</p>
                          <p className="text-xs text-warning/80">Some teams are behind on performance review submissions</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-primary/10 rounded-md border border-primary/20">
                      <div className="flex items-start space-x-2">
                        <Icon name="Target" size={16} className="text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-primary">Engagement Growth</p>
                          <p className="text-xs text-primary/80">Team engagement scores show consistent upward trend</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamAnalytics;