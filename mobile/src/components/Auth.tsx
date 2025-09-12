import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { useApp } from '../context/AppContext';
import { LanguageSelector } from './LanguageSelector';
import { API_BASE_URL } from '../config';
interface AuthProps {
  onAuthSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const { t } = useTranslation();
  const { register, login } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isForgotPassword) {
        // Handle forgot password
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
        
        setMessage(t('resetEmailSent'));
      } else if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error(t('passwordsDoNotMatch'));
        }
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
        });
        onAuthSuccess();
      } else {
        await login({
          email: formData.email,
          password: formData.password,
        });
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    });
    setError(null);
    setMessage(null);
  };

  const switchMode = (mode: 'login' | 'signup' | 'forgot') => {
    resetForm();
    setIsSignUp(mode === 'signup');
    setIsForgotPassword(mode === 'forgot');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        
        <div className="text-center mb-8">
          <img
            src="/logo-1.png"
            alt="eDog Logo"
            className="w-16 h-24 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">{t('welcome')} eDog</h1>
          <p className="text-gray-600">{t('personilized-pet-account')}</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold">
                {isForgotPassword ? t('resetPassword') : isSignUp ? t('create-account') : t('login')}
              </h2>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-600 text-sm">{message}</p>
              </div>
            )}

            {isForgotPassword && (
              <p className="text-sm text-gray-600 mb-4">
                {t('enterEmailForReset')}
              </p>
            )}

            {isSignUp && (
              <Input
                label={t('username')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            )}

            <Input
              label={t('your-email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            {!isForgotPassword && (
              <Input
                label={t('password')}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            )}

            {isSignUp && (
              <Input
                label={t('confirmPassword')}
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            )}

            {isSignUp && (
              <Input
                label={`${t('username')} (${t('optional')})`}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('loading') : 
                isForgotPassword ? t('sendResetEmail') :
                isSignUp ? t('create-account') : t('login')
              }
            </Button>

            <div className="text-center space-y-2">
              {!isForgotPassword && (
                <>
                  <button
                    type="button"
                    onClick={() => switchMode(isSignUp ? 'login' : 'signup')}
                    className="text-blueblue-500 hover:text-blueblue-700 text-sm block w-full"
                  >
                    {isSignUp ? t('already-account') + ' ' + t('login-here') : t('no-account') + ' ' + t('sign')}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    {t('forgotPassword')}
                  </button>
                </>
              )}
              
              {isForgotPassword && (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-blueblue-500 hover:text-blueblue-700 text-sm"
                >
                  {t('backToLogin')}
                </button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};