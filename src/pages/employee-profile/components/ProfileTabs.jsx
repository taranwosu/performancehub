// src/pages/employee-profile/components/ProfileTabs.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';

const ProfileTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex overflow-x-auto">
      <nav className="flex space-x-8 px-6 py-4" aria-label="Profile tabs">
        {tabs?.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={`flex items-center space-x-2 px-1 py-2 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
            }`}
          >
            <Icon name={tab.icon} size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileTabs;