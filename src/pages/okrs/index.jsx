// src/pages/okrs/index.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActions from '../../components/ui/QuickActions';
import Icon from '../../components/AppIcon';
import { useSupabase } from '../../context/SupabaseProvider';

const OKRs = () => {
  const { supabase, userProfile } = useSupabase();
  const [okrs, setOkrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOKR, setSelectedOKR] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    period: 'all',
    search: ''
  });

  useEffect(() => {
    fetchOKRs();
  }, []);

  const fetchOKRs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('okrs')
        .select(`
          *,
          assignee:user_profiles!okrs_user_id_fkey(id, first_name, last_name, avatar_url),
          created_by_user:user_profiles!okrs_created_by_fkey(id, first_name, last_name, avatar_url),
          performance_cycle:performance_cycles(*),
          key_results(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOkrs(data || []);
    } catch (error) {
      console.error('Error fetching OKRs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'cancelled':
        return 'bg-error/10 text-error border-error/20';
      case 'draft':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-text-secondary/10 text-text-secondary border-text-secondary/20';
    }
  };

  const calculateOKRProgress = (keyResults) => {
    if (!keyResults || keyResults.length === 0) return 0;
    const totalProgress = keyResults.reduce((sum, kr) => sum + (kr.progress || 0), 0);
    return Math.round(totalProgress / keyResults.length);
  };

  const filteredOKRs = okrs.filter(okr => {
    const matchesStatus = filters.status === 'all' || okr.status === filters.status;
    const matchesSearch = !filters.search || 
      okr.objective?.toLowerCase().includes(filters.search.toLowerCase()) ||
      okr.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

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
              <h1 className="text-3xl font-bold text-text-primary mb-2">OKRs (Objectives & Key Results)</h1>
              <p className="text-text-secondary">
                Set and track ambitious objectives with measurable key results
              </p>
            </div>
            
            {(userProfile?.role === 'manager' || userProfile?.role === 'hr' || userProfile?.role === 'executive') && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary flex items-center space-x-2 mt-4 lg:mt-0"
              >
                <Icon name="Plus" size={16} />
                <span>Create OKR</span>
              </button>
            )}
          </div>

          <QuickActions />

          {/* Filters */}
          <div className="card p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <Icon 
                  name="Search" 
                  size={16} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
                />
                <input
                  type="text"
                  placeholder="Search OKRs..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="form-input pl-10"
                />
              </div>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="form-select w-auto"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* OKRs Grid */}
          <div className="space-y-6">
            {filteredOKRs.length === 0 ? (
              <div className="card p-12 text-center">
                <Icon name="Target" size={48} className="mx-auto text-text-secondary mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">No OKRs found</h3>
                <p className="text-text-secondary mb-4">
                  {filters.search || filters.status !== 'all' ?'Try adjusting your filters to see more OKRs.' :'No OKRs have been created yet.'
                  }
                </p>
                {(userProfile?.role === 'manager' || userProfile?.role === 'hr') && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary"
                  >
                    Create OKR
                  </button>
                )}
              </div>
            ) : (
              filteredOKRs.map((okr) => {
                const progress = calculateOKRProgress(okr.key_results);
                
                return (
                  <div key={okr.id} className="card p-6 hover:shadow-medium transition-shadow duration-200">
                    {/* OKR Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h2 className="text-xl font-semibold text-text-primary">
                            {okr.objective}
                          </h2>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(okr.status)}`}>
                            {okr.status}
                          </span>
                        </div>
                        
                        {okr.description && (
                          <p className="text-text-secondary mb-3">
                            {okr.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-text-secondary">
                          {okr.assignee && (
                            <div className="flex items-center space-x-2">
                              <img
                                src={okr.assignee.avatar_url || `https://ui-avatars.com/api/?name=${okr.assignee.first_name}+${okr.assignee.last_name}&background=6366f1&color=fff`}
                                alt={`${okr.assignee.first_name} ${okr.assignee.last_name}`}
                                className="w-5 h-5 rounded-full"
                              />
                              <span>{okr.assignee.first_name} {okr.assignee.last_name}</span>
                            </div>
                          )}
                          
                          {okr.team_id && (
                            <div className="flex items-center space-x-1">
                              <Icon name="Users" size={14} />
                              <span>Team</span>
                            </div>
                          )}
                          
                          {okr.department && (
                            <div className="flex items-center space-x-1">
                              <Icon name="Building" size={14} />
                              <span>{okr.department}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-1">
                            <Icon name="Calendar" size={14} />
                            <span>
                              {new Date(okr.start_date).toLocaleDateString()} - {new Date(okr.end_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-text-primary mb-1">
                          {progress}%
                        </div>
                        <div className="text-xs text-text-secondary">
                          Overall Progress
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="w-full bg-background rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            progress >= 100 ? 'bg-success' :
                            progress >= 70 ? 'bg-primary' :
                            progress >= 30 ? 'bg-warning' : 'bg-error'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Key Results */}
                    {okr.key_results && okr.key_results.length > 0 && (
                      <div>
                        <h3 className="font-medium text-text-primary mb-3">
                          Key Results ({okr.key_results.length})
                        </h3>
                        <div className="space-y-3">
                          {okr.key_results.map((kr) => (
                            <div key={kr.id} className="bg-background rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-text-primary flex-1">
                                  {kr.key_result}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(kr.status)}`}>
                                  {kr.progress}%
                                </span>
                              </div>
                              
                              {kr.description && (
                                <p className="text-sm text-text-secondary mb-3">
                                  {kr.description}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
                                {kr.start_value !== null && kr.target_value !== null && (
                                  <span>
                                    {kr.current_value || kr.start_value} / {kr.target_value} {kr.unit}
                                  </span>
                                )}
                              </div>
                              
                              <div className="w-full bg-border rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${kr.progress || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                      <div className="text-xs text-text-secondary">
                        Created by {okr.created_by_user?.first_name} {okr.created_by_user?.last_name}
                      </div>
                      <button
                        onClick={() => setSelectedOKR(okr)}
                        className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* OKR Details Modal - You would implement this */}
      {selectedOKR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary">
                  {selectedOKR.objective}
                </h2>
                <button
                  onClick={() => setSelectedOKR(null)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <Icon name="X" size={24} />
                </button>
              </div>
              
              {/* Detailed OKR information would go here */}
              <div className="space-y-6">
                {selectedOKR.description && (
                  <div>
                    <h3 className="font-medium text-text-primary mb-2">Objective Description</h3>
                    <p className="text-text-secondary">{selectedOKR.description}</p>
                  </div>
                )}
                
                {selectedOKR.key_results && selectedOKR.key_results.length > 0 && (
                  <div>
                    <h3 className="font-medium text-text-primary mb-4">Key Results</h3>
                    <div className="space-y-4">
                      {selectedOKR.key_results.map((kr) => (
                        <div key={kr.id} className="border border-border rounded-lg p-4">
                          <h4 className="font-medium text-text-primary mb-2">{kr.key_result}</h4>
                          {kr.description && (
                            <p className="text-sm text-text-secondary mb-3">{kr.description}</p>
                          )}
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-text-secondary">Start:</span>
                              <span className="ml-2 font-medium">{kr.start_value} {kr.unit}</span>
                            </div>
                            <div>
                              <span className="text-text-secondary">Current:</span>
                              <span className="ml-2 font-medium">{kr.current_value || kr.start_value} {kr.unit}</span>
                            </div>
                            <div>
                              <span className="text-text-secondary">Target:</span>
                              <span className="ml-2 font-medium">{kr.target_value} {kr.unit}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OKRs;