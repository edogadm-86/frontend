import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Globe } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

interface AuthProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
  onRegister: (userData: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onRegister }) => {
  const { t, i18n } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await onRegister({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
        });
      } else {
        await onLogin({
          email: formData.email,
          password: formData.password,
        });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Language Selector */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center space-x-2 bg-white rounded-lg p-2 shadow-sm">
            <Globe size={16} className="text-gray-600" />
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="text-sm border-none focus:outline-none bg-transparent"
            >
              <option value="en">{t('english')}</option>
              <option value="bg">{t('bulgarian')}</option>
            </select>
          </div>
        </div>

        <Card className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">          
            <img
            src="/logo.png"
            alt="eDog Logo"
            className="w-20 h-30 mx-auto mb-4"
            />
            
            <h1 className="text-2xl font-bold text-gray-900">eDog Desktop</h1>
            <p className="text-gray-600 mt-2">
              {isSignUp ? t('createAccount') : t('welcome')}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <Input
                label={t('name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            )}

            <Input
              label={t('email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label={t('password')}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            {isSignUp && (
              <>
                <Input
                  label={t('confirmPassword')}
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <Input
                  label={`${t('phone')} (optional)`}
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('loading') : isSignUp ? t('signUp') : t('signIn')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {isSignUp ? t('alreadyHaveAccount') : t('noAccount')} {' '}
              {isSignUp ? t('signIn') : t('signUp')}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};