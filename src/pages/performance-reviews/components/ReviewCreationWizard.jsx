import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ReviewCreationWizard = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    template: '',
    employee: '',
    reviewPeriod: '',
    dueDate: '',
    goals: [],
    competencies: [],
    feedback: ''
  });

  const steps = [
    { id: 1, title: 'Template Selection', icon: 'FileTemplate' },
    { id: 2, title: 'Employee & Period', icon: 'User' },
    { id: 3, title: 'Goal Evaluation', icon: 'Target' },
    { id: 4, title: 'Competency Rating', icon: 'Star' },
    { id: 5, title: 'Feedback & Comments', icon: 'MessageSquare' }
  ];

  const templates = [
    {
      id: 'annual-2024',
      name: 'Annual Review 2024',
      description: 'Comprehensive annual performance review template with goal assessment and development planning',
      sections: ['Goals', 'Competencies', 'Achievements', 'Development Areas', 'Manager Feedback'],
      estimatedTime: '45-60 minutes'
    },
    {
      id: 'quarterly-q4',
      name: 'Quarterly Review Q4',
      description: 'Focused quarterly review for tracking progress and adjusting goals',
      sections: ['Goal Progress', 'Key Achievements', 'Challenges', 'Next Quarter Planning'],
      estimatedTime: '20-30 minutes'
    },
    {
      id: 'mid-year-2024',
      name: 'Mid-Year Review 2024',
      description: 'Mid-year checkpoint for goal adjustment and career development discussion',
      sections: ['Goal Assessment', 'Skill Development', 'Career Planning', 'Feedback'],
      estimatedTime: '30-45 minutes'
    }
  ];

  const employees = [
    {
      id: 1,
      name: 'Sarah Johnson',
      position: 'Senior Developer',
      department: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
    },
    {
      id: 2,
      name: 'Michael Chen',
      position: 'Product Manager',
      department: 'Product',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      position: 'UX Designer',
      department: 'Design',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
    }
  ];

  const competencies = [
    { id: 1, name: 'Technical Skills', description: 'Proficiency in job-related technical abilities' },
    { id: 2, name: 'Communication', description: 'Effective verbal and written communication' },
    { id: 3, name: 'Leadership', description: 'Ability to guide and inspire others' },
    { id: 4, name: 'Problem Solving', description: 'Analytical thinking and solution development' },
    { id: 5, name: 'Collaboration', description: 'Working effectively with team members' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Review created:', formData);
    onClose();
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Choose a Review Template
            </h3>
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    formData.template === template.id
                      ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                  }`}
                  onClick={() => updateFormData('template', template.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-text-primary">{template.name}</h4>
                      <p className="text-sm text-text-secondary mt-1">{template.description}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className="text-xs text-text-secondary">
                          <Icon name="Clock" size={12} className="inline mr-1" />
                          {template.estimatedTime}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {template.sections.length} sections
                        </span>
                      </div>
                    </div>
                    {formData.template === template.id && (
                      <Icon name="CheckCircle" size={20} className="text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-text-primary">
              Select Employee & Review Period
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Employee
              </label>
              <div className="space-y-2">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      formData.employee === employee.id
                        ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                    }`}
                    onClick={() => updateFormData('employee', employee.id)}
                  >
                    <Image
                      src={employee.avatar}
                      alt={employee.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-text-primary">{employee.name}</p>
                      <p className="text-sm text-text-secondary">{employee.position} • {employee.department}</p>
                    </div>
                    {formData.employee === employee.id && (
                      <Icon name="CheckCircle" size={20} className="text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Review Period
                </label>
                <select
                  value={formData.reviewPeriod}
                  onChange={(e) => updateFormData('reviewPeriod', e.target.value)}
                  className="form-input"
                >
                  <option value="">Select Period</option>
                  <option value="q4-2024">Q4 2024</option>
                  <option value="annual-2024">Annual 2024</option>
                  <option value="mid-year-2024">Mid-Year 2024</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => updateFormData('dueDate', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-text-primary">
              Goal Evaluation Setup
            </h3>
            <p className="text-text-secondary">
              Configure which goals will be evaluated in this review.
            </p>
            
            <div className="bg-background rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-text-primary">Current Goals</h4>
                <button className="text-primary hover:text-primary/80 text-sm">
                  Import from Goals
                </button>
              </div>
              
              <div className="space-y-3">
                {[1, 2, 3].map((goal) => (
                  <div key={goal} className="flex items-center justify-between p-3 bg-surface rounded border border-border">
                    <div>
                      <p className="font-medium text-text-primary">Goal {goal}</p>
                      <p className="text-sm text-text-secondary">Sample goal description</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                      defaultChecked
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-text-primary">
              Competency Rating Setup
            </h3>
            <p className="text-text-secondary">
              Select competencies to evaluate and set rating scales.
            </p>
            
            <div className="space-y-4">
              {competencies.map((competency) => (
                <div key={competency.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-text-primary">{competency.name}</h4>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                      defaultChecked
                    />
                  </div>
                  <p className="text-sm text-text-secondary">{competency.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-text-primary">
              Feedback & Comments
            </h3>
            <p className="text-text-secondary">
              Add any additional instructions or comments for this review.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Manager Instructions
              </label>
              <textarea
                value={formData.feedback}
                onChange={(e) => updateFormData('feedback', e.target.value)}
                rows={4}
                className="form-input"
                placeholder="Add any specific instructions or focus areas for this review..."
              />
            </div>

            <div className="bg-background rounded-lg p-4 border border-border">
              <h4 className="font-medium text-text-primary mb-2">Review Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Template:</span>
                  <span className="text-text-primary">
                    {templates.find(t => t.id === formData.template)?.name || 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Employee:</span>
                  <span className="text-text-primary">
                    {employees.find(e => e.id === formData.employee)?.name || 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Period:</span>
                  <span className="text-text-primary">{formData.reviewPeriod || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Due Date:</span>
                  <span className="text-text-primary">{formData.dueDate || 'Not set'}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1050 p-4">
      <div className="bg-surface rounded-lg shadow-medium max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">Create Performance Review</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors duration-200"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-200 ${
                  currentStep >= step.id
                    ? 'bg-primary border-primary text-white' :'border-border text-text-secondary'
                }`}>
                  {currentStep > step.id ? (
                    <Icon name="Check" size={16} />
                  ) : (
                    <Icon name={step.icon} size={16} />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium hidden sm:block ${
                  currentStep >= step.id ? 'text-text-primary' : 'text-text-secondary'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
              currentStep === 1
                ? 'text-text-secondary cursor-not-allowed' :'text-text-primary hover:bg-background'
            }`}
          >
            <Icon name="ArrowLeft" size={16} />
            <span>Previous</span>
          </button>

          <span className="text-sm text-text-secondary">
            Step {currentStep} of {steps.length}
          </span>

          {currentStep === steps.length ? (
            <button
              onClick={handleSubmit}
              className="btn-primary flex items-center space-x-2"
            >
              <Icon name="Check" size={16} />
              <span>Create Review</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn-primary flex items-center space-x-2"
            >
              <span>Next</span>
              <Icon name="ArrowRight" size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCreationWizard;