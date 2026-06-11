import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEmailVerification } from '../hooks/useEmailVerification';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Lock, Eye, EyeOff } from 'lucide-react';
import Spinner from '../components/Spinner';

export const ResetPassword = () => {
  const { t } = useTranslation(['auth']);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, validateResetToken, loading, error, success } = useEmailVerification();

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const checkToken = async () => {
      if (token) {
        const result = await validateResetToken(token);
        setTokenValid(result.valid);
        if (result.email) {
          setUserEmail(result.email);
        }
      } else {
        setTokenValid(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validation
    if (newPassword.length < 6) {
      setValidationError(t('auth:reset.tooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError(t('auth:reset.noMatch'));
      return;
    }

    if (!token) {
      setValidationError(t('auth:reset.invalidToken'));
      return;
    }

    try {
      await resetPassword(token, newPassword);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (loading && tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app p-4">
        <div className="bg-surface border border-white/5 p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <Spinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('auth:reset.validating')}</h2>
          <p className="text-gray-400">{t('auth:reset.validatingWait')}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app p-4">
        <div className="bg-surface border border-white/5 p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('auth:reset.successTitle')}</h2>
          <p className="text-gray-400 mb-6">
            {t('auth:reset.successDesc')}
          </p>
          <button
            onClick={handleGoToLogin}
            className="btn-primary w-full py-3"
          >
            {t('auth:goToLogin')}
          </button>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app p-4">
        <div className="bg-surface border border-white/5 p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('auth:reset.invalidTitle')}</h2>
          <p className="text-gray-400 mb-6">
            {error || t('auth:reset.invalidDesc')}
          </p>
          <button
            onClick={handleGoToLogin}
            className="btn-primary w-full py-3"
          >
            {t('auth:goToLogin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-app p-4">
      <div className="bg-surface border border-white/5 p-8 rounded-2xl shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <Lock className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('auth:reset.title')}</h2>
          {userEmail && (
            <p className="text-gray-400 text-sm">{t('auth:reset.for', { email: userEmail })}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth:reset.newPassword')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-deep border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t('auth:reset.newPasswordPlaceholder')}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth:reset.confirmPassword')}
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-surface-deep border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={t('auth:reset.confirmPasswordPlaceholder')}
              required
              minLength={6}
            />
          </div>

          {(validationError || error) && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {validationError || error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-icon w-full py-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Spinner size="sm" color="border-white" className="mr-2" />
                {t('auth:reset.submitting')}
              </>
            ) : (
              t('auth:reset.submit')
            )}
          </button>

          <button
            type="button"
            onClick={handleGoToLogin}
            className="w-full text-green-500 hover:text-green-400 font-medium py-2 transition duration-200"
          >
            {t('auth:backToLogin')}
          </button>
        </form>
      </div>
    </div>
  );
};
