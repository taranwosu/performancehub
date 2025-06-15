import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { SecureForm, SecureInput } from '../../../components/SecureForm';
import { useSupabase } from '../../../context/SupabaseProvider';
import { securityService } from '../../../services/securityService';

const SecureLoginForm = () => {
  const navigate = useNavigate();
  const { signIn } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);

  useEffect(() => {
    checkAccountLockStatus();
  }, []);

  const checkAccountLockStatus = () => {
    const attempts = localStorage.getItem('loginAttempts');
    const lastAttempt = localStorage.getItem('lastLoginAttempt');
    
    if (attempts && parseInt(attempts) >= 5) {
      const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
      const lockoutDuration = 15 * 60 * 1000;
      
      if (timeSinceLastAttempt < lockoutDuration) {
        setIsLocked(true);
        setLockoutTime(parseInt(lastAttempt) + lockoutDuration);
        setLoginAttempts(parseInt(attempts));
      } else {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lastLoginAttempt');
      }
    }
  };

  const validationRules = {
    email: {
      type: 'email',
      required: true
    },
    password: {
      type: 'password',
      required: true,
      options: {
        minLength: 1
      }
    }
  };

  const handleSubmit = async (formData) => {
    if (isLocked) {
      return;
    }

    setLoading(true);

    try {
      const rateLimitResult = securityService.checkRateLimit(
        formData.email,
        'login_attempt',
        5,
        15 * 60 * 1000
      );

      if (!rateLimitResult.allowed) {
        setIsLocked(true);
        setLockoutTime(rateLimitResult.resetTime);
        throw new Error('Too many login attempts. Please try again later.');
      }

      await securityService.logSecurityEvent('login_attempt', {
        email: formData.email,
        user_agent: navigator.userAgent
      });

      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        const currentAttempts = parseInt(localStorage.getItem('loginAttempts') || '0') + 1;
        localStorage.setItem('loginAttempts', currentAttempts.toString());
        localStorage.setItem('lastLoginAttempt', Date.now().toString());
        
        setLoginAttempts(currentAttempts);

        if (currentAttempts >= 5) {
          setIsLocked(true);
          setLockoutTime(Date.now() + 15 * 60 * 1000);
        }

        await securityService.logSecurityEvent('login_failed', {
          email: formData.email,
          reason: error.message,
          attempt_number: currentAttempts
        });

        throw new Error(error.message);
      }

      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('lastLoginAttempt');
      
      await securityService.logSecurityEvent('login_success', {
        email: formData.email,
        user_id: data.user?.id
      });

      securityService.initializeSessionTimeout();
      navigate('/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRemainingLockoutTime = () => {
    if (!lockoutTime) return 0;
    const remaining = Math.max(0, lockoutTime - Date.now());
    return Math.ceil(remaining / 60000);
  };

  const getSecurityMessage = () => {
    if (isLocked) {
      const remainingMinutes = getRemainingLockoutTime();
      if (remainingMinutes > 0) {
        return {
          type: 'error',
          message: `Account temporarily locked. Try again in ${remainingMinutes} minute(s).`
        };
      } else {
        setIsLocked(false);
        setLockoutTime(null);
        return null;
      }
    }

    if (loginAttempts >= 2 && loginAttempts < 5) {
      return {
        type: 'warning',
        message: `${5 - loginAttempts} attempt(s) remaining before account lockout.`
      };
    }

    return null;
  };

  const securityMessage = getSecurityMessage();

  return (
    <div className="space-y-6">
      {securityMessage && (
        <div className={`p-4 rounded-lg border ${
          securityMessage.type === 'error' 
            ? 'bg-error/10 border-error/20 text-error' 
            : 'bg-warning/10 border-warning/20 text-warning'
        }`}>
          <div className="flex items-center space-x-2">
            <Icon 
              name={securityMessage.type === 'error' ? 'XCircle' : 'AlertTriangle'} 
              size={16} 
            />
            <p className="text-sm font-medium">{securityMessage.message}</p>
          </div>
        </div>
      )}

      <SecureForm
        onSubmit={handleSubmit}
        validationRules={validationRules}
        rateLimitKey="login"
        maxAttempts={5}
        className="space-y-4"
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
            Email Address
          </label>
          <SecureInput
            id="email"
            name="email"
            type="email"
            validationType="email"
            required
            disabled={isLocked}
            placeholder="Enter your email"
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
            Password
          </label>
          <SecureInput
            id="password"
            name="password"
            type="password"
            validationType="password"
            required
            disabled={isLocked}
            placeholder="Enter your password"
            className="form-input"
            validationOptions={{ minLength: 1 }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || isLocked}
          className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <Icon name="LogIn" size={16} />
              <span>Sign In</span>
            </>
          )}
        </button>
      </SecureForm>

      <div className="text-center space-y-2">
        <Link 
          to="/forgot-password" 
          className="text-sm text-primary hover:text-primary/80 transition-colors duration-200"
        >
          Forgot your password?
        </Link>
        
        <div className="text-xs text-text-secondary">
          <p>🔒 Your connection is secured with end-to-end encryption</p>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-text-primary mb-1">Security Tips</p>
            <ul className="text-text-secondary space-y-1">
              <li>• Never share your login credentials</li>
              <li>• Use a strong, unique password</li>
              <li>• Log out when using shared computers</li>
              <li>• Report suspicious activity immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureLoginForm;
