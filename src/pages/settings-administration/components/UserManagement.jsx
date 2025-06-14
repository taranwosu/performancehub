// src/pages/settings-administration/components/UserManagement.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Mock user data
  const users = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'HR Manager',
      department: 'Human Resources',
      status: 'active',
      lastLogin: '2024-01-20',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      role: 'Software Engineer',
      department: 'Engineering',
      status: 'active',
      lastLogin: '2024-01-19',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@company.com',
      role: 'Marketing Manager',
      department: 'Marketing',
      status: 'active',
      lastLogin: '2024-01-18',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'David Park',
      email: 'david.park@company.com',
      role: 'Sales Representative',
      department: 'Sales',
      status: 'inactive',
      lastLogin: '2024-01-10',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      email: 'lisa.thompson@company.com',
      role: 'Financial Analyst',
      department: 'Finance',
      status: 'active',
      lastLogin: '2024-01-20',
      avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=40&h=40&fit=crop&crop=face'
    }
  ];

  const roles = ['HR Manager', 'Software Engineer', 'Marketing Manager', 'Sales Representative', 'Financial Analyst'];
  const departments = ['Human Resources', 'Engineering', 'Marketing', 'Sales', 'Finance'];

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) || 
                         user?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesRole = selectedRole === 'all' || user?.role === selectedRole;
    const matchesDepartment = selectedDepartment === 'all' || user?.department === selectedDepartment;
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev?.includes(userId) 
        ? prev?.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers?.length === filteredUsers?.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers?.map(user => user?.id));
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'text-success bg-success/10' : 'text-warning bg-warning/10';
  };

  return (
    <div className="p-6">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Employee Management
          </h3>
          <p className="text-sm text-text-secondary">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="btn-primary flex items-center space-x-2">
            <Icon name="UserPlus" size={16} />
            <span>Add User</span>
          </button>
          {selectedUsers?.length > 0 && (
            <div className="relative">
              <button 
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="btn-outline flex items-center space-x-2"
              >
                <Icon name="MoreVertical" size={16} />
                <span>Bulk Actions ({selectedUsers?.length})</span>
              </button>
              
              {showBulkActions && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-lg shadow-medium z-10">
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-background transition-colors duration-200">
                      Activate Users
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-background transition-colors duration-200">
                      Deactivate Users
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-background transition-colors duration-200">
                      Change Department
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-background transition-colors duration-200">
                      Export Selected
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="input-field pl-10"
          />
        </div>
        
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e?.target?.value)}
          className="input-field"
        >
          <option value="all">All Roles</option>
          {roles?.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e?.target?.value)}
          className="input-field"
        >
          <option value="all">All Departments</option>
          {departments?.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        
        <button className="btn-outline flex items-center justify-center space-x-2">
          <Icon name="Download" size={16} />
          <span>Export</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <input
                  type="checkbox"
                  checked={selectedUsers?.length === filteredUsers?.length && filteredUsers?.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">User</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Role</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Department</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Last Login</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers?.map(user => (
              <tr key={user?.id} className="border-b border-border hover:bg-background transition-colors duration-200">
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers?.includes(user?.id)}
                    onChange={() => handleUserSelect(user?.id)}
                    className="rounded"
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-text-primary">{user?.name}</div>
                      <div className="text-sm text-text-secondary">{user?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-text-primary">{user?.role}</td>
                <td className="py-3 px-4 text-sm text-text-primary">{user?.department}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user?.status)}`}>
                    {user?.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-text-secondary">
                  {new Date(user?.lastLogin)?.toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 rounded hover:bg-background transition-colors duration-200">
                      <Icon name="Edit" size={16} className="text-text-secondary hover:text-text-primary" />
                    </button>
                    <button className="p-1 rounded hover:bg-background transition-colors duration-200">
                      <Icon name="MoreVertical" size={16} className="text-text-secondary hover:text-text-primary" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-text-secondary">
          Showing {filteredUsers?.length} of {users?.length} users
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded border border-border hover:bg-background transition-colors duration-200">
            <Icon name="ChevronLeft" size={16} className="text-text-secondary" />
          </button>
          <button className="px-3 py-1 rounded bg-primary text-white">1</button>
          <button className="px-3 py-1 rounded border border-border hover:bg-background transition-colors duration-200">2</button>
          <button className="px-3 py-1 rounded border border-border hover:bg-background transition-colors duration-200">3</button>
          <button className="p-2 rounded border border-border hover:bg-background transition-colors duration-200">
            <Icon name="ChevronRight" size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;