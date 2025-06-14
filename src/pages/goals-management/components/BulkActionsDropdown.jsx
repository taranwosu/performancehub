// src/pages/goals-management/components/BulkActionsDropdown.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { useSupabase } from '../../../context/SupabaseProvider';

const BulkActionsDropdown = ({ selectedCount, selectedGoals = [], onActionComplete }) => {
  const { updateGoal, deleteGoal, supabase } = useSupabase();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBulkAction = async (action, value = null) => {
    if (selectedGoals.length === 0) return;
    
    try {
      setLoading(true);
      
      switch (action) {
        case 'status':
          await Promise.all(
            selectedGoals.map(goalId => 
              updateGoal(goalId, { status: value })
            )
          );
          break;
          
        case 'priority':
          await Promise.all(
            selectedGoals.map(goalId => 
              updateGoal(goalId, { priority: value })
            )
          );
          break;
          
        case 'department':
          await Promise.all(
            selectedGoals.map(goalId => 
              updateGoal(goalId, { department: value })
            )
          );
          break;
          
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedCount} goals? This action cannot be undone.`)) {
            await Promise.all(
              selectedGoals.map(goalId => deleteGoal(goalId))
            );
          }
          break;
          
        case 'export':
          await handleExport();
          break;
          
        default:
          break;
      }
      
      onActionComplete?.();
      setIsOpen(false);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          assignee:user_profiles!goals_user_id_fkey(first_name, last_name, email),
          manager:user_profiles!goals_manager_id_fkey(first_name, last_name, email)
        `)
        .in('id', selectedGoals);
      
      if (error) throw error;
      
      // Convert to CSV
      const csvContent = convertToCSV(data);
      downloadCSV(csvContent, `goals-export-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error exporting goals:', error);
    }
  };

  const convertToCSV = (data) => {
    const headers = [
      'Title',
      'Description', 
      'Status',
      'Priority',
      'Progress',
      'Department',
      'Category',
      'Start Date',
      'Due Date',
      'Assignee',
      'Manager',
      'Created Date'
    ];
    
    const rows = data.map(goal => [
      goal.title,
      goal.description || '',
      goal.status,
      goal.priority,
      goal.progress,
      goal.department || '',
      goal.category || '',
      goal.start_date || '',
      goal.due_date || '',
      goal.assignee ? `${goal.assignee.first_name} ${goal.assignee.last_name}` : '',
      goal.manager ? `${goal.manager.first_name} ${goal.manager.last_name}` : '',
      new Date(goal.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    return csvContent;
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="btn-secondary flex items-center space-x-2"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        ) : (
          <Icon name="MoreHorizontal" size={16} />
        )}
        <span>Bulk Actions ({selectedCount})</span>
        <Icon name="ChevronDown" size={14} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-surface border border-border rounded-md shadow-medium z-20">
            <div className="py-2">
              {/* Status Actions */}
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
                  Update Status
                </p>
                <div className="space-y-1">
                  {[
                    { value: 'active', label: 'Set to Active', icon: 'Play' },
                    { value: 'on_hold', label: 'Put On Hold', icon: 'Pause' },
                    { value: 'completed', label: 'Mark Completed', icon: 'CheckCircle' },
                    { value: 'cancelled', label: 'Cancel Goals', icon: 'X' }
                  ].map(status => (
                    <button
                      key={status.value}
                      onClick={() => handleBulkAction('status', status.value)}
                      className="w-full flex items-center space-x-2 px-2 py-1 text-sm text-text-secondary hover:text-text-primary hover:bg-background rounded transition-colors duration-200"
                    >
                      <Icon name={status.icon} size={14} />
                      <span>{status.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-border" />

              {/* Priority Actions */}
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
                  Update Priority
                </p>
                <div className="space-y-1">
                  {[
                    { value: 'low', label: 'Set to Low', color: 'text-success' },
                    { value: 'medium', label: 'Set to Medium', color: 'text-primary' },
                    { value: 'high', label: 'Set to High', color: 'text-warning' },
                    { value: 'critical', label: 'Set to Critical', color: 'text-error' }
                  ].map(priority => (
                    <button
                      key={priority.value}
                      onClick={() => handleBulkAction('priority', priority.value)}
                      className="w-full flex items-center space-x-2 px-2 py-1 text-sm text-text-secondary hover:text-text-primary hover:bg-background rounded transition-colors duration-200"
                    >
                      <div className={`w-2 h-2 rounded-full ${priority.color.replace('text-', 'bg-')}`}></div>
                      <span>{priority.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-border" />

              {/* Other Actions */}
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
                  Other Actions
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => handleBulkAction('export')}
                    className="w-full flex items-center space-x-2 px-2 py-1 text-sm text-text-secondary hover:text-text-primary hover:bg-background rounded transition-colors duration-200"
                  >
                    <Icon name="Download" size={14} />
                    <span>Export to CSV</span>
                  </button>
                  
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="w-full flex items-center space-x-2 px-2 py-1 text-sm text-error hover:bg-error/10 rounded transition-colors duration-200"
                  >
                    <Icon name="Trash2" size={14} />
                    <span>Delete Selected</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BulkActionsDropdown;