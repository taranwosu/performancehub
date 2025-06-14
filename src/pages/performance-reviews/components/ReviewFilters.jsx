import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ReviewFilters = ({ filters, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const filterOptions = {
    reviewType: [
      { value: 'all', label: 'All Types' },
      { value: 'annual', label: 'Annual Review' },
      { value: 'quarterly', label: 'Quarterly Review' },
      { value: 'mid-year', label: 'Mid-Year Review' },
      { value: 'performance', label: 'Performance Review' },
      { value: 'probation', label: 'Probation Review' }
    ],
    period: [
      { value: 'all', label: 'All Periods' },
      { value: 'q4-2024', label: 'Q4 2024' },
      { value: 'q3-2024', label: 'Q3 2024' },
      { value: 'q2-2024', label: 'Q2 2024' },
      { value: 'q1-2024', label: 'Q1 2024' },
      { value: '2024', label: '2024 Annual' }
    ],
    department: [
      { value: 'all', label: 'All Departments' },
      { value: 'engineering', label: 'Engineering' },
      { value: 'product', label: 'Product' },
      { value: 'design', label: 'Design' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'sales', label: 'Sales' },
      { value: 'hr', label: 'Human Resources' },
      { value: 'finance', label: 'Finance' },
      { value: 'analytics', label: 'Analytics' }
    ],
    status: [
      { value: 'all', label: 'All Statuses' },
      { value: 'draft', label: 'Draft' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'completed', label: 'Completed' },
      { value: 'overdue', label: 'Overdue' }
    ]
  };

  const handleFilterChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  const handleDateRangeChange = (type, value) => {
    onFilterChange('dateRange', {
      ...filters.dateRange,
      [type]: value
    });
  };

  const clearAllFilters = () => {
    onFilterChange('reviewType', 'all');
    onFilterChange('period', 'all');
    onFilterChange('department', 'all');
    onFilterChange('status', 'all');
    onFilterChange('dateRange', { start: '', end: '' });
  };

  const hasActiveFilters = () => {
    return filters.reviewType !== 'all' || 
           filters.period !== 'all' || 
           filters.department !== 'all' || 
           filters.status !== 'all' ||
           filters.dateRange.start || 
           filters.dateRange.end;
  };

  return (
    <div className="card">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden border-b border-border p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={16} className="text-text-secondary" />
            <span className="font-medium text-text-primary">Filters</span>
            {hasActiveFilters() && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Active
              </span>
            )}
          </div>
          <Icon 
            name="ChevronDown" 
            size={16} 
            className={`text-text-secondary transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Filter Content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary flex items-center space-x-2">
              <Icon name="Filter" size={18} />
              <span>Filters</span>
            </h3>
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-primary hover:text-primary/80 transition-colors duration-200"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Review Type Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Review Type
              </label>
              <select
                value={filters.reviewType}
                onChange={(e) => handleFilterChange('reviewType', e.target.value)}
                className="form-input"
              >
                {filterOptions.reviewType.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Review Period
              </label>
              <select
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                className="form-input"
              >
                {filterOptions.period.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="form-input"
              >
                {filterOptions.department.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="form-input"
              >
                {filterOptions.status.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  placeholder="Start Date"
                  className="form-input"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  placeholder="End Date"
                  className="form-input"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Quick Filters
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => handleFilterChange('status', 'overdue')}
                  className="w-full text-left px-3 py-2 text-sm rounded-md bg-error/10 text-error hover:bg-error/20 transition-colors duration-200"
                >
                  <Icon name="AlertTriangle" size={14} className="inline mr-2" />
                  Overdue Reviews
                </button>
                <button
                  onClick={() => handleFilterChange('status', 'in-progress')}
                  className="w-full text-left px-3 py-2 text-sm rounded-md bg-warning/10 text-warning hover:bg-warning/20 transition-colors duration-200"
                >
                  <Icon name="Clock" size={14} className="inline mr-2" />
                  In Progress
                </button>
                <button
                  onClick={() => handleFilterChange('status', 'completed')}
                  className="w-full text-left px-3 py-2 text-sm rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors duration-200"
                >
                  <Icon name="CheckCircle" size={14} className="inline mr-2" />
                  Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewFilters;