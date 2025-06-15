// src/pages/settings-administration/components/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useSupabase } from '../../../context/SupabaseProvider';

const UserManagement = () => {
  const { supabase, user: currentUser } = useSupabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const roles = [
    { value: 'employee', label: 'Employee' },
    { value: 'manager', label: 'Manager' },
    { value: 'hr', label: 'HR' },
    { value: 'executive', label: 'Executive' }
  ];

  // Load users from Supabase
  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, [pagination.page, selectedRole, selectedDepartment, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('user_profiles')
        .select(`
          *,
          manager:user_profiles!user_profiles_manager_id_fkey(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (selectedRole !== 'all') {
        query = query.eq('role', selectedRole);
      }
      
      if (selectedDepartment !== 'all') {
        query = query.eq('department', selectedDepartment);
      }

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      // Pagination
      const offset = (pagination.page - 1) * pagination.limit;
      query = query.range(offset, offset + pagination.limit - 1);

      const { data, error, count } = await query;
      
      if (error) throw error;

      setUsers(data || []);
      setPagination(prev => ({ ...prev, total: count || 0 }));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('department')
        .not('department', 'is', null);

      if (error) throw error;

      const uniqueDepartments = [...new Set(data.map(item => item.department))].filter(Boolean);
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: newStatus === 'active' })
        .eq('id', userId);

      if (error) throw error;

      // Refresh users list
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleBulkStatusChange = async (status) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: status === 'active' })
        .in('id', selectedUsers);

      if (error) throw error;

      setSelectedUsers([]);
      setShowBulkActions(false);
      loadUsers();
    } catch (error) {
      console.error('Error updating users status:', error);
      alert('Failed to update users status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Note: We soft delete by setting is_active to false instead of actual deletion
      // to preserve data integrity and audit trails
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) throw error;

      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users;

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'text-success bg-success/10' : 'text-warning bg-warning/10';
  };

  const formatLastLogin = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            User Management
          </h3>
          <p className="text-sm text-text-secondary">
            Manage user accounts, roles, and permissions ({users.length} total users)
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowAddUserModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Icon name="UserPlus" size={16} />
            <span>Add User</span>
          </button>
          {selectedUsers.length > 0 && (
            <div className="relative">
              <button 
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="btn-outline flex items-center space-x-2"
              >
                <Icon name="MoreVertical" size={16} />
                <span>Bulk Actions ({selectedUsers.length})</span>
              </button>
              
              {showBulkActions && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-lg shadow-medium z-10">
                  <div className="py-2">
                    <button 
                      onClick={() => handleBulkStatusChange('active')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-background transition-colors duration-200"
                    >
                      Activate Users
                    </button>
                    <button 
                      onClick={() => handleBulkStatusChange('inactive')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-background transition-colors duration-200"
                    >
                      Deactivate Users
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
        
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="form-input"
        >
          <option value="all">All Roles</option>
          {roles.map(role => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>
        
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="form-input"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
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
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">User</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Role</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Department</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Created</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b border-border hover:bg-background transition-colors duration-200">
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserSelect(user.id)}
                    className="rounded"
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.first_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary text-sm font-medium">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-text-secondary">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-text-primary">{user.department || 'Not assigned'}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.is_active)}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-text-secondary">
                  {formatLastLogin(user.created_at)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        setEditingUser(user);
                        setShowEditUserModal(true);
                      }}
                      className="p-1 rounded hover:bg-background transition-colors duration-200"
                    >
                      <Icon name="Edit" size={16} className="text-text-secondary hover:text-text-primary" />
                    </button>
                    <button 
                      onClick={() => handleUserStatusChange(user.id, user.is_active ? 'inactive' : 'active')}
                      className="p-1 rounded hover:bg-background transition-colors duration-200"
                    >
                      <Icon name={user.is_active ? "UserX" : "UserCheck"} size={16} className="text-text-secondary hover:text-text-primary" />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-1 rounded hover:bg-background transition-colors duration-200"
                    >
                      <Icon name="Trash2" size={16} className="text-error hover:text-error" />
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
          Showing {Math.min(pagination.limit, filteredUsers.length)} of {pagination.total} users
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="p-2 rounded border border-border hover:bg-background transition-colors duration-200 disabled:opacity-50"
          >
            <Icon name="ChevronLeft" size={16} className="text-text-secondary" />
          </button>
          <span className="px-3 py-1 rounded bg-primary text-white">{pagination.page}</span>
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page * pagination.limit >= pagination.total}
            className="p-2 rounded border border-border hover:bg-background transition-colors duration-200 disabled:opacity-50"
          >
            <Icon name="ChevronRight" size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal 
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          onUserAdded={() => {
            loadUsers();
            setShowAddUserModal(false);
          }}
          departments={departments}
        />
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <EditUserModal 
          isOpen={showEditUserModal}
          user={editingUser}
          onClose={() => {
            setShowEditUserModal(false);
            setEditingUser(null);
          }}
          onUserUpdated={() => {
            loadUsers();
            setShowEditUserModal(false);
            setEditingUser(null);
          }}
          departments={departments}
        />
      )}
    </div>
  );
};

// Add User Modal Component
const AddUserModal = ({ isOpen, onClose, onUserAdded, departments }) => {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'employee',
    department: '',
    position: '',
    phone: '',
    location: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate temporary password
      const tempPassword = 'TempPassword123!';

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: tempPassword,
        email_confirm: true
      });

      if (authError) throw authError;

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          department: formData.department,
          position: formData.position,
          phone: formData.phone,
          location: formData.location,
          is_active: true
        });

      if (profileError) throw profileError;

      // Send welcome email notification
      try {
        const { notificationService } = await import('../../../services/notificationService');
        await notificationService.sendWelcomeEmail(
          formData.email,
          `${formData.first_name} ${formData.last_name}`,
          tempPassword
        );
      } catch (notificationError) {
        console.error('Error sending welcome email:', notificationError);
        // Don't fail user creation if email fails
      }

      onUserAdded();
      alert('User created successfully! They will receive a welcome email with login instructions.');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Add New User</h3>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
              <Icon name="X" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="form-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="form-input"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="form-input"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Position</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                className="form-input"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary"
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModal = ({ isOpen, user, onClose, onUserUpdated, departments }) => {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    role: user?.role || 'employee',
    department: user?.department || '',
    position: user?.position || '',
    phone: user?.phone || '',
    location: user?.location || '',
    is_active: user?.is_active ?? true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;

      onUserUpdated();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Edit User</h3>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
              <Icon name="X" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="form-input"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="form-input"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Position</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                className="form-input"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded mr-2"
                />
                <span className="text-sm text-text-primary">Active User</span>
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary"
              >
                {loading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;