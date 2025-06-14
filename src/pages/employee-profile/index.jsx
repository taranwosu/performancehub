// src/pages/employee-profile/index.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import EmployeeInfo from './components/EmployeeInfo';
import ProfileTabs from './components/ProfileTabs';
import OverviewTab from './components/OverviewTab';
import GoalsTab from './components/GoalsTab';
import ReviewsTab from './components/ReviewsTab';
import FeedbackTab from './components/FeedbackTab';
import DevelopmentTab from './components/DevelopmentTab';

const EmployeeProfile = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUser] = useState({
    role: 'manager', // or 'employee'
    id: 'current-user-id'
  });

  // Mock employee data - in real app this would come from API
  const [employee] = useState({
    id: searchParams.get('id') || 'emp-001',
    name: 'Alex Rodriguez',
    role: 'Senior Software Engineer',
    department: 'Engineering',
    email: 'alex.rodriguez@company.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    startDate: '2022-03-15',
    manager: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    performanceScore: 92,
    goalsCompleted: 15,
    totalGoals: 18,
    tenure: '1.8 years',
    status: 'active'
  });

  // Custom breadcrumb for employee profile
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Team', path: '/team-analytics' },
    { label: employee?.name || 'Employee Profile', path: '/employee-profile', isLast: true }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'goals', label: 'Goals', icon: 'Target' },
    { id: 'reviews', label: 'Reviews', icon: 'FileText' },
    { id: 'feedback', label: 'Feedback', icon: 'MessageSquare' },
    { id: 'development', label: 'Development', icon: 'TrendingUp' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab employee={employee} currentUser={currentUser} />;
      case 'goals':
        return <GoalsTab employee={employee} currentUser={currentUser} />;
      case 'reviews':
        return <ReviewsTab employee={employee} currentUser={currentUser} />;
      case 'feedback':
        return <FeedbackTab employee={employee} currentUser={currentUser} />;
      case 'development':
        return <DevelopmentTab employee={employee} currentUser={currentUser} />;
      default:
        return <OverviewTab employee={employee} currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <Breadcrumb customItems={breadcrumbItems} />
          
          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
            {/* Left Column - Employee Info (30%) */}
            <div className="lg:col-span-3">
              <EmployeeInfo employee={employee} currentUser={currentUser} />
            </div>
            
            {/* Right Column - Tabbed Interface (70%) */}
            <div className="lg:col-span-7">
              <div className="card">
                {/* Tab Navigation */}
                <div className="border-b border-border">
                  <ProfileTabs 
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                </div>
                
                {/* Tab Content */}
                <div className="p-6">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeProfile;