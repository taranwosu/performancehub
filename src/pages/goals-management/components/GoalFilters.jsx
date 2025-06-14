// src/pages/goals-management/components/GoalFilters.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useSupabase } from '../../../context/SupabaseProvider';

const GoalFilters = ({ filters, onFiltersChange, goals = [] }) => {
  const { supabase } = useSupabase();
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load filter options from database
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        // Get unique departments
        const { data: deptData } = await supabase
          .from('user_profiles')
          .select('department')
          .not('department', 'is', null)
          .order('department');
        
        const uniqueDepts = [...new Set(deptData?.map(d => d.department).filter(Boolean))];
        setDepartments(uniqueDepts);

        // Get active users
        const { data: userData } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, position')
          .eq('is_active', true)
          .order('first_name');
        
        setUsers(userData || []);
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };

    loadFilterOptions();
  }, [supabase]);

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      timePeriod: 'all',
      status: 'all',
      assignee: 'all',
      department: 'all',
      search: ''
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.timePeriod !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.assignee !== 'all') count++;
    if (filters.department !== 'all') count++;
    if (filters.search) count++;
    return count;
  };

  const getGoalCounts = () => {
    const counts = {
      total: goals.length,
      draft: goals.filter(g => g.status === 'draft').length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      on_hold: goals.filter(g => g.status === 'on_hold').length,
      overdue: goals.filter(g => {
        const dueDate = new Date(g.due_date);
        const today = new Date();
        return dueDate < today && g.status !== 'completed';
      }).length
    };
    return counts;
  };

  const counts = getGoalCounts();
  const activeFilters = getActiveFiltersCount();

  return (
    <div className="card p-6 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary flex items-center">
          <Icon name="Filter" size={20} className="mr-2" />
          Filters
          {activeFilters > 0 && (
            <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              {activeFilters}
            </span>
          )}
        </h3>
        {activeFilters > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-text-secondary hover:text-primary transition-colors duration-200"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Goal Overview */}
      <div className="mb-6 p-4 bg-background rounded-lg">
        <h4 className="text-sm font-medium text-text-primary mb-3">Goal Overview</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Total Goals</span>
            <span className="font-medium text-text-primary">{counts.total}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Active</span>
            <span className="font-medium text-primary">{counts.active}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Completed</span>
            <span className="font-medium text-success">{counts.completed}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Draft</span>
            <span className="font-medium text-warning">{counts.draft}</span>
          </div>
          {counts.overdue > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Overdue</span>
              <span className="font-medium text-error">{counts.overdue}</span>
            </div>
          )}
        </div>
      </div>

      {/* Time Period Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-primary mb-2">
          Time Period
        </label>
        <select
          value={filters.timePeriod}
          onChange={(e) => handleFilterChange('timePeriod', e.target.value)}
          className="form-input"
        >
          <option value="all">All Time</option>
          <option value="this-week">This Week</option>
          <option value="this-month">This Month</option>
          <option value="this-quarter">This Quarter</option>
          <option value="this-year">This Year</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-primary mb-2">
          Status
        </label>
        <div className="space-y-2">
          {[
            { value: 'all', label: 'All Status', count: counts.total },
            { value: 'draft', label: 'Draft', count: counts.draft },
            { value: 'active', label: 'Active', count: counts.active },
            { value: 'completed', label: 'Completed', count: counts.completed },
            { value: 'on_hold', label: 'On Hold', count: counts.on_hold },
            { value: 'cancelled', label: 'Cancelled', count: 0 }
          ].map((status) => (
            <label key={status.value} className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value={status.value}
                  checked={filters.status === status.value}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="text-primary focus:ring-primary border-border"
                />
                <span className="text-sm text-text-secondary">{status.label}</span>
              </div>
              <span className="text-xs text-text-secondary bg-background px-2 py-1 rounded-full">
                {status.count}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Department Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-primary mb-2">
          Department
        </label>
        <select
          value={filters.department}
          onChange={(e) => handleFilterChange('department', e.target.value)}
          className="form-input"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center justify-between w-full text-sm font-medium text-text-primary mb-4 p-2 hover:bg-background rounded-md transition-colors duration-200"
      >
        <span>Advanced Filters</span>
        <Icon 
          name={showAdvanced ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          className="text-text-secondary"
        />
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 border-t border-border pt-4">
          {/* Assignee Filter */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Assignee
            </label>
            <select
              value={filters.assignee}
              onChange={(e) => handleFilterChange('assignee', e.target.value)}
              className="form-input"
            >
              <option value="all">All Assignees</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} - {user.position || 'Team Member'}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Priority
            </label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Priority' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' }
              ].map((priority) => (
                <label key={priority.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={filters.priority === priority.value}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="text-primary focus:ring-primary border-border"
                  />
                  <span className="text-sm text-text-secondary">{priority.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Goal Type Filter */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Goal Type
            </label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Types' },
                { value: 'individual', label: 'Individual' },
                { value: 'team', label: 'Team' },
                { value: 'departmental', label: 'Departmental' },
                { value: 'organizational', label: 'Organizational' }
              ].map((type) => (
                <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="goalType"
                    value={type.value}
                    checked={filters.goalType === type.value}
                    onChange={(e) => handleFilterChange('goalType', e.target.value)}
                    className="text-primary focus:ring-primary border-border"
                  />
                  <span className="text-sm text-text-secondary">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-text-primary mb-3">Quick Filters</h4>
        <div className="space-y-2">
          <button
            onClick={() => handleFilterChange('status', 'active')}
            className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-background rounded-md transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <span>My Active Goals</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {counts.active}
              </span>
            </div>
          </button>
          
          <button
            onClick={() => handleFilterChange('timePeriod', 'overdue')}
            className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-error hover:bg-error/10 rounded-md transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <span>Overdue Goals</span>
              {counts.overdue > 0 && (
                <span className="text-xs bg-error/10 text-error px-2 py-1 rounded-full">
                  {counts.overdue}
                </span>
              )}
            </div>
          </button>
          
          <button
            onClick={() => handleFilterChange('timePeriod', 'this-week')}
            className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-warning hover:bg-warning/10 rounded-md transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <span>Due This Week</span>
              <Icon name="Clock" size={14} className="text-warning" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalFilters;