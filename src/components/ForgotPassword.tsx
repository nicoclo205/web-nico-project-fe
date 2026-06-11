import { useState } from 'react';
import { useEmailVerification } from '../hooks/useEmailVerification';
import { useTranslation } from 'react-i18next';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import Spinner from './Spinner';

interface ForgotPasswordProps {
  onBack: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const { t } = useTranslation(['auth']);
  const [email, setEmail] = useState('');
  const { requestPasswordReset, loading, error, success } = useEmailVerification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    try {
      await requestPasswordReset(email);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  if (success) {
    return (
      <div className="bg-surface border border-white/5 p-8 rounded-2xl shadow-lg max-w-md w-full">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('auth:forgot.checkEmail')}</h2>
          <p className="text-gray-400 mb-6">
            {t('auth:forgot.checkEmailDesc', { email })}
          </p>
          <button
            onClick={onBack}
            className="btn-primary btn-icon w-full py-3"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('auth:backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-white/5 p-8 rounded-2xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <Mail className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">{t('auth:forgot.title')}</h2>
        <p className="text-gray-400 text-sm">
          {t('auth:forgot.desc')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            {t('auth:forgot.emailLabel')}
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-surface-deep border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={t('auth:forgot.emailPlaceholder')}
            required
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
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
              {t('auth:forgot.sending')}
            </>
          ) : (
            t('auth:forgot.send')
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-green-500 hover:text-green-400 font-medium py-2 transition duration-200 flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('auth:backToLogin')}
        </button>
      </form>
    </div>
  );
};
