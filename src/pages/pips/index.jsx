// src/pages/pips/index.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActions from '../../components/ui/QuickActions';
import Icon from '../../components/AppIcon';
import { useSupabase } from '../../context/SupabaseProvider';

const PIPs = () => {
  const { supabase, userProfile } = useSupabase();
  const [pips, setPips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPIP, setSelectedPIP] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  useEffect(() => {
    fetchPIPs();
  }, []);

  const fetchPIPs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pips')
        .select(`
          *,
          employee:user_profiles!pips_employee_id_fkey(id, first_name, last_name, avatar_url),
          manager:user_profiles!pips_manager_id_fkey(id, first_name, last_name, avatar_url),
          hr:user_profiles!pips_hr_id_fkey(id, first_name, last_name, avatar_url),
          pip_milestones(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPips(data || []);
    } catch (error) {
      console.error('Error fetching PIPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'cancelled':
        return 'bg-error/10 text-error border-error/20';
      case 'extended':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-text-secondary/10 text-text-secondary border-text-secondary/20';
    }
  };

  const filteredPIPs = pips.filter(pip => {
    const matchesStatus = filters.status === 'all' || pip.status === filters.status;
    const matchesSearch = !filters.search || 
      pip.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      pip.employee?.first_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      pip.employee?.last_name?.toLowerCase().includes(filters.search.toLowerCase());
    
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
              <h1 className="text-3xl font-bold text-text-primary mb-2">Performance Improvement Plans</h1>
              <p className="text-text-secondary">
                Manage and track performance improvement initiatives
              </p>
            </div>
            
            {(userProfile?.role === 'manager' || userProfile?.role === 'hr' || userProfile?.role === 'executive') && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary flex items-center space-x-2 mt-4 lg:mt-0"
              >
                <Icon name="Plus" size={16} />
                <span>Create PIP</span>
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
                  placeholder="Search PIPs..."
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
                <option value="extended">Extended</option>
              </select>
            </div>
          </div>

          {/* PIPs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPIPs.length === 0 ? (
              <div className="col-span-full">
                <div className="card p-12 text-center">
                  <Icon name="AlertTriangle" size={48} className="mx-auto text-text-secondary mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">No PIPs found</h3>
                  <p className="text-text-secondary mb-4">
                    {filters.search || filters.status !== 'all' ?'Try adjusting your filters to see more PIPs.' :'No performance improvement plans have been created yet.'
                    }
                  </p>
                  {(userProfile?.role === 'manager' || userProfile?.role === 'hr') && (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="btn-primary"
                    >
                      Create PIP
                    </button>
                  )}
                </div>
              </div>
            ) : (
              filteredPIPs.map((pip) => (
                <div key={pip.id} className="card p-6 hover:shadow-medium transition-shadow duration-200">
                  {/* PIP Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary mb-2 line-clamp-2">
                        {pip.title}
                      </h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <img
                          src={pip.employee?.avatar_url || `https://ui-avatars.com/api/?name=${pip.employee?.first_name}+${pip.employee?.last_name}&background=6366f1&color=fff`}
                          alt={`${pip.employee?.first_name} ${pip.employee?.last_name}`}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-text-secondary">
                          {pip.employee?.first_name} {pip.employee?.last_name}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(pip.status)}`}>
                      {pip.status}
                    </span>
                  </div>

                  {/* Description */}
                  {pip.description && (
                    <p className="text-sm text-text-secondary mb-4 line-clamp-3">
                      {pip.description}
                    </p>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-text-secondary mb-1">Start Date</p>
                      <p className="text-sm font-medium text-text-primary">
                        {new Date(pip.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary mb-1">End Date</p>
                      <p className="text-sm font-medium text-text-primary">
                        {new Date(pip.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  {pip.pip_milestones && pip.pip_milestones.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-text-secondary">Progress</span>
                        <span className="font-medium text-text-primary">
                          {pip.pip_milestones.filter(m => m.is_completed).length}/{pip.pip_milestones.length} milestones
                        </span>
                      </div>
                      <div className="w-full bg-background rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${pip.pip_milestones.length > 0 
                              ? (pip.pip_milestones.filter(m => m.is_completed).length / pip.pip_milestones.length) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center space-x-2 text-xs text-text-secondary">
                      <Icon name="Calendar" size={12} />
                      <span>Review: {pip.review_frequency}</span>
                    </div>
                    <button
                      onClick={() => setSelectedPIP(pip)}
                      className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PIP Details Modal - You would implement this */}
      {selectedPIP && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary">
                  PIP Details: {selectedPIP.title}
                </h2>
                <button
                  onClick={() => setSelectedPIP(null)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <Icon name="X" size={24} />
                </button>
              </div>
              
              {/* Detailed PIP information would go here */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-text-primary mb-2">Description</h3>
                  <p className="text-text-secondary">{selectedPIP.description}</p>
                </div>
                
                {selectedPIP.improvement_areas && selectedPIP.improvement_areas.length > 0 && (
                  <div>
                    <h3 className="font-medium text-text-primary mb-2">Improvement Areas</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedPIP.improvement_areas.map((area, index) => (
                        <li key={index} className="text-text-secondary">{area}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedPIP.success_criteria && (
                  <div>
                    <h3 className="font-medium text-text-primary mb-2">Success Criteria</h3>
                    <p className="text-text-secondary">{selectedPIP.success_criteria}</p>
                  </div>
                )}
                
                {selectedPIP.support_resources && (
                  <div>
                    <h3 className="font-medium text-text-primary mb-2">Support Resources</h3>
                    <p className="text-text-secondary">{selectedPIP.support_resources}</p>
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

export default PIPs;