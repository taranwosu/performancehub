// src/pages/profile/index.jsx
import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import { useSupabase } from '../../context/SupabaseProvider';
import { useForm } from 'react-hook-form';

const Profile = () => {
  const { user, userProfile, updateProfile, signOut } = useSupabase();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      first_name: userProfile?.first_name || '',
      last_name: userProfile?.last_name || '',
      position: userProfile?.position || '',
      department: userProfile?.department || '',
      phone: userProfile?.phone || '',
      location: userProfile?.location || '',
      timezone: userProfile?.timezone || 'UTC'
    }
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      await updateProfile(data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    reset();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
          <Breadcrumb />
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Profile Settings</h1>
            <p className="text-text-secondary">
              Manage your personal information and account settings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="card p-6 text-center">
                <div className="mb-6">
                  <img
                    src={userProfile?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}&background=6366f1&color=fff&size=128`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                  <h2 className="text-xl font-semibold text-text-primary">
                    {userProfile?.first_name} {userProfile?.last_name}
                  </h2>
                  <p className="text-text-secondary">{userProfile?.position || 'Team Member'}</p>
                  <p className="text-sm text-text-secondary">{user?.email}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Department:</span>
                    <span className="font-medium text-text-primary">
                      {userProfile?.department || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Role:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      userProfile?.role === 'executive' ? 'bg-purple-100 text-purple-800' :
                      userProfile?.role === 'hr' ? 'bg-blue-100 text-blue-800' :
                      userProfile?.role === 'manager'? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {userProfile?.role || 'employee'}
                    </span>
                  </div>
                  {userProfile?.hire_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Joined:</span>
                      <span className="font-medium text-text-primary">
                        {new Date(userProfile.hire_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-6 border-t border-border">
                  <button
                    onClick={handleSignOut}
                    className="w-full btn-secondary flex items-center justify-center space-x-2"
                  >
                    <Icon name="LogOut" size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-primary">
                    Personal Information
                  </h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Icon name="Edit2" size={16} />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>

                {/* Messages */}
                {error && (
                  <div className="mb-4 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 bg-success/10 border border-success/20 text-success px-4 py-3 rounded-md text-sm">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-text-primary mb-2">
                        First Name
                      </label>
                      <input
                        id="first_name"
                        type="text"
                        disabled={!isEditing}
                        {...register('first_name', {
                          required: 'First name is required',
                          minLength: {
                            value: 2,
                            message: 'First name must be at least 2 characters'
                          }
                        })}
                        className={`form-input ${
                          !isEditing ? 'bg-background border-border' : ''
                        } ${errors.first_name ? 'border-error focus:ring-error' : ''}`}
                      />
                      {errors.first_name && (
                        <p className="text-error text-sm mt-1">{errors.first_name.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-text-primary mb-2">
                        Last Name
                      </label>
                      <input
                        id="last_name"
                        type="text"
                        disabled={!isEditing}
                        {...register('last_name', {
                          required: 'Last name is required',
                          minLength: {
                            value: 2,
                            message: 'Last name must be at least 2 characters'
                          }
                        })}
                        className={`form-input ${
                          !isEditing ? 'bg-background border-border' : ''
                        } ${errors.last_name ? 'border-error focus:ring-error' : ''}`}
                      />
                      {errors.last_name && (
                        <p className="text-error text-sm mt-1">{errors.last_name.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="form-input bg-background border-border"
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      Email cannot be changed. Contact your administrator if needed.
                    </p>
                  </div>

                  {/* Job Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-text-primary mb-2">
                        Position
                      </label>
                      <input
                        id="position"
                        type="text"
                        disabled={!isEditing}
                        {...register('position')}
                        className={`form-input ${
                          !isEditing ? 'bg-background border-border' : ''
                        }`}
                        placeholder="e.g., Senior Developer"
                      />
                    </div>
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-text-primary mb-2">
                        Department
                      </label>
                      <input
                        id="department"
                        type="text"
                        disabled={!isEditing}
                        {...register('department')}
                        className={`form-input ${
                          !isEditing ? 'bg-background border-border' : ''
                        }`}
                        placeholder="e.g., Engineering"
                      />
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        disabled={!isEditing}
                        {...register('phone')}
                        className={`form-input ${
                          !isEditing ? 'bg-background border-border' : ''
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-text-primary mb-2">
                        Location
                      </label>
                      <input
                        id="location"
                        type="text"
                        disabled={!isEditing}
                        {...register('location')}
                        className={`form-input ${
                          !isEditing ? 'bg-background border-border' : ''
                        }`}
                        placeholder="e.g., New York, NY"
                      />
                    </div>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-text-primary mb-2">
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      disabled={!isEditing}
                      {...register('timezone')}
                      className={`form-select ${
                        !isEditing ? 'bg-background border-border' : ''
                      }`}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>

                  {/* Form Actions */}
                  {isEditing && (
                    <div className="flex items-center space-x-4 pt-6 border-t border-border">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary flex items-center space-x-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Icon name="Save" size={16} />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="btn-secondary"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;