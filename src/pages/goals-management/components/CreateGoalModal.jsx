// src/pages/goals-management/components/CreateGoalModal.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { useSupabase } from '../../../context/SupabaseProvider';

const CreateGoalModal = ({ isOpen, onClose, onGoalCreated }) => {
  const { createGoal, supabase, user, userProfile } = useSupabase();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    department: '',
    priority: 'medium',
    start_date: new Date().toISOString().split('T')[0],
    due_date: '',
    user_id: user?.id,
    manager_id: userProfile?.manager_id,
    assignedTo: [],
    tags: [],
    template: '',
    metrics: [{ name: '', target_value: '', unit: '' }],
    dependencies: []
  });

  const [newTag, setNewTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load team members from Supabase
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, position, avatar_url, department')
          .eq('is_active', true);
        
        if (error) throw error;
        setTeamMembers(data || []);
      } catch (error) {
        console.error('Error loading team members:', error);
      }
    };

    if (isOpen) {
      loadTeamMembers();
    }
  }, [isOpen, supabase]);

  const templates = [
    { id: 'custom', name: 'Custom Goal', description: 'Create a goal from scratch' },
    { id: 'okr', name: 'OKR Template', description: 'Objectives and Key Results format' },
    { id: 'sales', name: 'Sales Target', description: 'Revenue and sales metrics' },
    { id: 'customer', name: 'Customer Success', description: 'Customer satisfaction and retention' }
  ];

  const departments = ['Engineering', 'Sales', 'Marketing', 'Customer Success', 'Operations', 'Human Resources'];
  const categories = ['Product Development', 'Customer Experience', 'Cost Optimization', 'Market Expansion', 'Employee Development'];
  
  const filteredMembers = teamMembers.filter(member =>
    `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAssignMember = (member) => {
    const isAssigned = formData.assignedTo.some(assigned => assigned.id === member.id);
    if (isAssigned) {
      setFormData(prev => ({
        ...prev,
        assignedTo: prev.assignedTo.filter(assigned => assigned.id !== member.id)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        assignedTo: [...prev.assignedTo, member]
      }));
    }
  };

  const handleAddMetric = () => {
    setFormData(prev => ({
      ...prev,
      metrics: [...prev.metrics, { name: '', target_value: '', unit: '' }]
    }));
  };

  const handleMetricChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.map((metric, i) =>
        i === index ? { ...metric, [field]: value } : metric
      )
    }));
  };

  const handleRemoveMetric = (index) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Prepare goal data
      const goalData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        department: formData.department,
        priority: formData.priority,
        start_date: formData.start_date,
        due_date: formData.due_date,
        user_id: formData.user_id,
        manager_id: formData.manager_id,
        tags: formData.tags,
        goal_type: 'individual',
        status: 'draft',
        progress: 0
      };

      // Create the goal
      const newGoal = await createGoal(goalData);
      
      // Create goal metrics if any
      if (formData.metrics.length > 0 && formData.metrics[0].name) {
        const metricsToCreate = formData.metrics
          .filter(metric => metric.name && metric.target_value)
          .map(metric => ({
            goal_id: newGoal.id,
            name: metric.name,
            target_value: metric.target_value,
            unit: metric.unit || null,
            current_value: '0'
          }));

        if (metricsToCreate.length > 0) {
          const { error: metricsError } = await supabase
            .from('goal_metrics')
            .insert(metricsToCreate);
          
          if (metricsError) {
            console.error('Error creating goal metrics:', metricsError);
          }
        }
      }

      onGoalCreated(newGoal);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        department: '',
        priority: 'medium',
        start_date: new Date().toISOString().split('T')[0],
        due_date: '',
        user_id: user?.id,
        manager_id: userProfile?.manager_id,
        assignedTo: [],
        tags: [],
        template: '',
        metrics: [{ name: '', target_value: '', unit: '' }],
        dependencies: []
      });
      setCurrentStep(1);
      
    } catch (error) {
      console.error('Error creating goal:', error);
      setError(error.message || 'Failed to create goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.template;
      case 2:
        return formData.title && formData.description && formData.category && formData.department;
      case 3:
        return true; // Optional step
      case 4:
        return formData.due_date;
      default:
        return true;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1030 p-4">
      <div className="bg-surface rounded-lg shadow-medium w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Create New Goal</h2>
            <p className="text-sm text-text-secondary mt-1">
              Step {currentStep} of 4: {
                currentStep === 1 ? 'Choose Template' :
                currentStep === 2 ? 'Goal Details' :
                currentStep === 3 ? 'Assign Team': 'Timeline & Metrics'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background transition-colors duration-200"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-primary text-white' :'bg-background text-text-secondary'
                }`}>
                  {step < currentStep ? <Icon name="Check" size={16} /> : step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${
                    step < currentStep ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-error/10 border border-error/20 text-error rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-text-primary mb-4">Choose a Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleInputChange('template', template.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      formData.template === template.id
                        ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                    }`}
                  >
                    <h4 className="font-medium text-text-primary mb-2">{template.name}</h4>
                    <p className="text-sm text-text-secondary">{template.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Goal Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter a clear, specific goal title"
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what success looks like for this goal"
                  className="form-input min-h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Priority
                </label>
                <div className="flex space-x-4">
                  {['low', 'medium', 'high', 'critical'].map((priority) => (
                    <label key={priority} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={priority}
                        checked={formData.priority === priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className="text-primary focus:ring-primary border-border"
                      />
                      <span className="text-sm text-text-secondary capitalize">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-primary/60 hover:text-primary"
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add a tag"
                    className="form-input flex-1"
                  />
                  <button
                    onClick={handleAddTag}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Assign Team Members (Optional)</h3>
              
              {/* Search */}
              <div className="relative">
                <Icon 
                  name="Search" 
                  size={16} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search team members..."
                  className="form-input pl-10"
                />
              </div>

              {/* Selected Members */}
              {formData.assignedTo.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-3">
                    Selected Members ({formData.assignedTo.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.assignedTo.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-2 rounded-lg"
                      >
                        <Image
                          src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.first_name}+${member.last_name}&background=6366f1&color=fff`}
                          alt={`${member.first_name} ${member.last_name}`}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium">{member.first_name} {member.last_name}</span>
                        <button
                          onClick={() => handleAssignMember(member)}
                          className="text-primary/60 hover:text-primary"
                        >
                          <Icon name="X" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Members */}
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-3">Available Team Members</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredMembers.map((member) => {
                    const isAssigned = formData.assignedTo.some(assigned => assigned.id === member.id);
                    return (
                      <div
                        key={member.id}
                        onClick={() => handleAssignMember(member)}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                          isAssigned
                            ? 'bg-primary/10 border border-primary/20' :'hover:bg-background border border-transparent'
                        }`}
                      >
                        <Image
                          src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.first_name}+${member.last_name}&background=6366f1&color=fff`}
                          alt={`${member.first_name} ${member.last_name}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">{member.first_name} {member.last_name}</p>
                          <p className="text-xs text-text-secondary">{member.position || 'Team Member'}</p>
                        </div>
                        {isAssigned && (
                          <Icon name="Check" size={16} className="text-primary" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Timeline & Success Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                    className="form-input"
                    min={formData.start_date}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-text-primary">
                    Success Metrics (Optional)
                  </label>
                  <button
                    onClick={handleAddMetric}
                    className="btn-secondary text-sm"
                  >
                    <Icon name="Plus" size={14} className="mr-1" />
                    Add Metric
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.metrics.map((metric, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-start">
                      <input
                        type="text"
                        value={metric.name}
                        onChange={(e) => handleMetricChange(index, 'name', e.target.value)}
                        placeholder="Metric name"
                        className="form-input col-span-5"
                      />
                      <input
                        type="text"
                        value={metric.target_value}
                        onChange={(e) => handleMetricChange(index, 'target_value', e.target.value)}
                        placeholder="Target value"
                        className="form-input col-span-3"
                      />
                      <input
                        type="text"
                        value={metric.unit}
                        onChange={(e) => handleMetricChange(index, 'unit', e.target.value)}
                        placeholder="Unit (e.g., %, $, items)"
                        className="form-input col-span-3"
                      />
                      {formData.metrics.length > 1 && (
                        <button
                          onClick={() => handleRemoveMetric(index)}
                          className="col-span-1 p-2 text-error hover:bg-error/10 rounded-md transition-colors duration-200"
                        >
                          <Icon name="Trash2" size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Previous
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid() || loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Create Goal</span>
                    <Icon name="Check" size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGoalModal;