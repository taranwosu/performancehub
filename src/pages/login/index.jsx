// src/pages/login/index.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/SupabaseProvider';
import Icon from '../../components/AppIcon';


const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      
      if (isLogin) {
        await signIn(data.email, data.password);
        navigate('/dashboard');
      } else {
        const userData = {
          first_name: data.firstName,
          last_name: data.lastName
        };
        
        const result = await signUp(data.email, data.password, userData);
        
        if (result.user && !result.user.email_confirmed_at) {
          setError('Please check your email and click the confirmation link to activate your account.');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-3">
              <Icon name="Target" size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">PerformanceHub</h1>
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-text-secondary">
            {isLogin 
              ? 'Sign in to access your performance dashboard' 
              : 'Join your team\'s performance management platform'
            }
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* First Name & Last Name (Sign Up Only) */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-text-primary mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'First name must be at least 2 characters'
                      }
                    })}
                    className={`form-input ${
                      errors.firstName ? 'border-error focus:ring-error' : ''
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-error text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-text-primary mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    {...register('lastName', {
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Last name must be at least 2 characters'
                      }
                    })}
                    className={`form-input ${
                      errors.lastName ? 'border-error focus:ring-error' : ''
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-error text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className={`form-input ${
                  errors.email ? 'border-error focus:ring-error' : ''
                }`}
                placeholder="john.doe@company.com"
              />
              {errors.email && (
                <p className="text-error text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className={`form-input ${
                  errors.password ? 'border-error focus:ring-error' : ''
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-error text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password (Login Only) */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-primary hover:text-primary/80 transition-colors duration-200"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <Icon name="ArrowRight" size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface text-text-secondary">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-text-primary bg-surface hover:bg-background transition-colors duration-200"
            >
              <Icon name="Mail" size={16} className="mr-2" />
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-text-primary bg-surface hover:bg-background transition-colors duration-200"
            >
              <Icon name="Github" size={16} className="mr-2" />
              GitHub
            </button>
          </div>
        </div>

        {/* Toggle Form */}
        <div className="text-center mt-6">
          <p className="text-text-secondary">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={toggleMode}
              className="ml-2 text-primary hover:text-primary/80 font-medium transition-colors duration-200"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Demo Info */}
        <div className="mt-8 p-4 bg-accent/10 rounded-lg border border-accent/20">
          <h3 className="text-sm font-medium text-text-primary mb-2">Demo Access</h3>
          <div className="text-xs text-text-secondary space-y-1">
            <p><strong>Manager:</strong> manager@demo.com / password123</p>
            <p><strong>Employee:</strong> employee@demo.com / password123</p>
            <p><strong>HR:</strong> hr@demo.com / password123</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-text-secondary">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:text-primary/80">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:text-primary/80">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;