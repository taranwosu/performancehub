import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../AppIcon';
import Image from '../AppImage';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Mock user data - in real app this would come from context/props
  const user = {
    name: 'Sarah Johnson',
    role: 'HR Manager',
    email: 'sarah.johnson@company.com',
    avatar: '/assets/images/avatar-placeholder.jpg'
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logging out...');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger */}
      <button
        onClick={handleToggle}
        className="flex items-center space-x-3 p-2 rounded-md hover:bg-background transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <Image
          src={user.avatar}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="hidden lg:block text-left">
          <p className="text-sm font-medium text-text-primary">{user.name}</p>
          <p className="text-xs text-text-secondary">{user.role}</p>
        </div>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`text-text-secondary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-surface rounded-lg shadow-medium border border-border z-1010 animate-scale-in">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <Image
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user.name}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {user.email}
                </p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/employee-profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-background transition-colors duration-200"
            >
              <Icon name="User" size={16} className="mr-3" />
              View Profile
            </Link>
            
            <Link
              to="/settings-administration"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-background transition-colors duration-200"
            >
              <Icon name="Settings" size={16} className="mr-3" />
              Account Settings
            </Link>
            
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-background transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              <Icon name="Bell" size={16} className="mr-3" />
              Notification Preferences
            </button>
            
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-background transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              <Icon name="HelpCircle" size={16} className="mr-3" />
              Help & Support
            </button>
          </div>

          {/* Logout Section */}
          <div className="border-t border-border py-2">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors duration-200"
            >
              <Icon name="LogOut" size={16} className="mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;