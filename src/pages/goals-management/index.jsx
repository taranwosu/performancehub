// src/pages/goals-management/index.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActions from '../../components/ui/QuickActions';
import Icon from '../../components/AppIcon';
import { useSupabase } from '../../context/SupabaseProvider';

import GoalFilters from './components/GoalFilters';
import GoalCard from './components/GoalCard';
import GoalDetails from './components/GoalDetails';
import CreateGoalModal from './components/CreateGoalModal';
import BulkActionsDropdown from './components/BulkActionsDropdown';

const GoalsManagement = () => {
  const { fetchGoals, deleteGoal, userProfile } = useSupabase();
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    timePeriod: 'all',
    status: 'all',
    assignee: 'all',
    department: 'all',
    search: ''
  });

  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);

  // Load goals from Supabase
  useEffect(() => {
    const loadGoals = async () => {
      try {
        setLoading(true);
        const goalsData = await fetchGoals();
        setGoals(goalsData || []);
      } catch (error) {
        console.error('Error loading goals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, [fetchGoals]);

  // Filter goals based on current filters
  useEffect(() => {
    let filtered = goals;

    if (filters.search) {
      filtered = filtered.filter(goal =>
        goal.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        goal.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(goal => goal.status === filters.status);
    }

    if (filters.department !== 'all') {
      filtered = filtered.filter(goal => goal.department === filters.department);
    }

    if (filters.timePeriod !== 'all') {
      const now = new Date();
      filtered = filtered.filter(goal => {
        const dueDate = new Date(goal.due_date);
        switch (filters.timePeriod) {
          case 'this-week':
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            return dueDate <= weekFromNow;
          case 'this-month':
            const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            return dueDate <= monthFromNow;
          case 'this-quarter':
            const quarterFromNow = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
            return dueDate <= quarterFromNow;
          default:
            return true;
        }
      });
    }

    setFilteredGoals(filtered);
  }, [filters, goals]);

  const handleGoalSelect = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    setSelectedGoal(goal);
  };

  const handleBulkSelect = (goalId, isSelected) => {
    if (isSelected) {
      setSelectedGoals([...selectedGoals, goalId]);
    } else {
      setSelectedGoals(selectedGoals.filter(id => id !== goalId));
    }
  };

  const handleSelectAll = () => {
    if (selectedGoals.length === filteredGoals.length) {
      setSelectedGoals([]);
    } else {
      setSelectedGoals(filteredGoals.map(goal => goal.id));
    }
  };

  const handleGoalCreated = async (newGoal) => {
    // Refresh goals list after creation
    try {
      const goalsData = await fetchGoals();
      setGoals(goalsData || []);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error refreshing goals:', error);
    }
  };

  const handleGoalDeleted = async (goalId) => {
    try {
      await deleteGoal(goalId);
      setGoals(goals.filter(g => g.id !== goalId));
      if (selectedGoal?.id === goalId) {
        setSelectedGoal(null);
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'active':
        return 'text-primary';
      case 'draft':
        return 'text-warning';
      case 'on_hold':
        return 'text-text-secondary';
      default:
        return 'text-text-secondary';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'active':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'draft':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'on_hold':
        return 'bg-text-secondary/10 text-text-secondary border-text-secondary/20';
      default:
        return 'bg-text-secondary/10 text-text-secondary border-text-secondary/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16">
        <div className="px-6 lg:px-8 py-6">
          <Breadcrumb />
          
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Goals Management</h1>
              <p className="text-text-secondary">
                Track and manage organizational goals across all departments and time periods
              </p>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary hover:bg-background'
                  }`}
                >
                  <Icon name="List" size={18} />
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'kanban' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary hover:bg-background'
                  }`}
                >
                  <Icon name="Columns" size={18} />
                </button>
              </div>
              
              {selectedGoals.length > 0 && (
                <BulkActionsDropdown selectedCount={selectedGoals.length} />
              )}
              
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Icon name="Plus" size={16} />
                <span>Create Goal</span>
              </button>
            </div>
          </div>

          <QuickActions />

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <GoalFilters 
                filters={filters}
                onFiltersChange={setFilters}
                goals={goals}
              />
            </div>

            {/* Center Panel - Goals List */}
            <div className={`${selectedGoal ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <div className="card p-6">
                {/* Search and Bulk Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <div className="relative flex-1 sm:w-80">
                      <Icon 
                        name="Search" 
                        size={16} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
                      />
                      <input
                        type="text"
                        placeholder="Search goals..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="form-input pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {filteredGoals.length > 0 && (
                      <label className="flex items-center space-x-2 text-sm text-text-secondary">
                        <input
                          type="checkbox"
                          checked={selectedGoals.length === filteredGoals.length}
                          onChange={handleSelectAll}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span>Select All ({filteredGoals.length})</span>
                      </label>
                    )}
                    
                    <span className="text-sm text-text-secondary">
                      {filteredGoals.length} of {goals.length} goals
                    </span>
                  </div>
                </div>

                {/* Goals List */}
                {viewMode === 'list' ? (
                  <div className="space-y-4">
                    {filteredGoals.length === 0 ? (
                      <div className="text-center py-12">
                        <Icon name="Target" size={48} className="mx-auto text-text-secondary mb-4" />
                        <h3 className="text-lg font-medium text-text-primary mb-2">No goals found</h3>
                        <p className="text-text-secondary mb-4">
                          {filters.search || filters.status !== 'all' || filters.department !== 'all' ?'Try adjusting your filters to see more goals.' :'Create your first goal to get started with performance tracking.'
                          }
                        </p>
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="btn-primary"
                        >
                          Create Goal
                        </button>
                      </div>
                    ) : (
                      filteredGoals.map((goal) => (
                        <GoalCard
                          key={goal.id}
                          goal={goal}
                          isSelected={selectedGoals.includes(goal.id)}
                          onSelect={() => handleGoalSelect(goal.id)}
                          onBulkSelect={(isSelected) => handleBulkSelect(goal.id, isSelected)}
                          onDelete={() => handleGoalDeleted(goal.id)}
                          getStatusColor={getStatusColor}
                          getStatusBadgeColor={getStatusBadgeColor}
                        />
                      ))
                    )}
                  </div>
                ) : (
                  // Kanban View
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['draft', 'active', 'completed'].map((status) => (
                      <div key={status} className="bg-background rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium text-text-primary capitalize">
                            {status.replace('_', ' ')}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(status)}`}>
                            {filteredGoals.filter(g => g.status === status).length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {filteredGoals
                            .filter(goal => goal.status === status)
                            .map((goal) => (
                              <div
                                key={goal.id}
                                onClick={() => handleGoalSelect(goal.id)}
                                className="bg-surface p-4 rounded-lg border border-border hover:shadow-medium transition-all duration-200 cursor-pointer"
                              >
                                <h4 className="font-medium text-text-primary mb-2 line-clamp-2">
                                  {goal.title}
                                </h4>
                                <div className="flex items-center justify-between text-sm text-text-secondary">
                                  <span>{goal.progress}%</span>
                                  <span>{new Date(goal.due_date).toLocaleDateString()}</span>
                                </div>
                                <div className="w-full bg-border rounded-full h-2 mt-2">
                                  <div
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${goal.progress}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Goal Details */}
            {selectedGoal && (
              <div className="lg:col-span-1">
                <GoalDetails 
                  goal={selectedGoal}
                  onClose={() => setSelectedGoal(null)}
                  onDelete={() => handleGoalDeleted(selectedGoal.id)}
                  getStatusColor={getStatusColor}
                  getStatusBadgeColor={getStatusBadgeColor}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Goal Modal */}
      {isCreateModalOpen && (
        <CreateGoalModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onGoalCreated={handleGoalCreated}
        />
      )}
    </div>
  );
};

export default GoalsManagement;