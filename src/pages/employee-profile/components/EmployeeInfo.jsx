// src/pages/employee-profile/components/EmployeeInfo.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const EmployeeInfo = ({ employee, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    phone: employee?.phone || '',
    location: employee?.location || ''
  });

  const canEdit = currentUser?.role === 'manager' || currentUser?.id === employee?.id;

  const handleSave = () => {
    // In real app, this would make an API call
    console.log('Saving employee data:', editableData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableData({
      phone: employee?.phone || '',
      location: employee?.location || ''
    });
    setIsEditing(false);
  };

  const formatTenure = (startDate) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years}.${months} years`;
    }
    return `${months} months`;
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-primary';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="space-y-6">
      {/* Employee Photo and Basic Info */}
      <div className="card p-6">
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <Image
              src={employee?.avatar}
              alt={employee?.name}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
            />
            <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-surface flex items-center justify-center ${
              employee?.status === 'active' ? 'bg-success' : 'bg-text-secondary'
            }`}>
              <div className="w-3 h-3 rounded-full bg-white"></div>
            </div>
          </div>
          
          <h1 className="text-xl font-bold text-text-primary mb-1">
            {employee?.name}
          </h1>
          <p className="text-text-secondary mb-2">{employee?.role}</p>
          <p className="text-sm text-text-secondary">{employee?.department}</p>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">Contact Info</h3>
            {canEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Icon name="Mail" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-primary">{employee?.email}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Icon name="Phone" size={16} className="text-text-secondary" />
              {isEditing ? (
                <input
                  type="text"
                  value={editableData.phone}
                  onChange={(e) => setEditableData({...editableData, phone: e.target.value})}
                  className="text-sm bg-background border border-border rounded px-2 py-1 flex-1"
                />
              ) : (
                <span className="text-sm text-text-primary">{employee?.phone}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Icon name="MapPin" size={16} className="text-text-secondary" />
              {isEditing ? (
                <input
                  type="text"
                  value={editableData.location}
                  onChange={(e) => setEditableData({...editableData, location: e.target.value})}
                  className="text-sm bg-background border border-border rounded px-2 py-1 flex-1"
                />
              ) : (
                <span className="text-sm text-text-primary">{employee?.location}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Icon name="Calendar" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-primary">
                Started {new Date(employee?.startDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Icon name="User" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-primary">Reports to {employee?.manager}</span>
            </div>
          </div>
          
          {isEditing && (
            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleSave}
                className="btn-primary text-sm"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card p-6">
        <h3 className="font-semibold text-text-primary mb-4">Quick Stats</h3>
        
        <div className="space-y-4">
          {/* Performance Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Performance Score</span>
              <span className={`text-lg font-bold ${getPerformanceColor(employee?.performanceScore)}`}>
                {employee?.performanceScore}%
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  employee?.performanceScore >= 90 ? 'bg-success' :
                  employee?.performanceScore >= 75 ? 'bg-primary' :
                  employee?.performanceScore >= 60 ? 'bg-warning' : 'bg-error'
                }`}
                style={{ width: `${employee?.performanceScore}%` }}
              />
            </div>
          </div>
          
          {/* Goals Completed */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Goals Completed</span>
            <span className="text-lg font-bold text-text-primary">
              {employee?.goalsCompleted}/{employee?.totalGoals}
            </span>
          </div>
          
          {/* Tenure */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Tenure</span>
            <span className="text-lg font-bold text-text-primary">
              {formatTenure(employee?.startDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeInfo;