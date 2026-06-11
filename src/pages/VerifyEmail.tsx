import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEmailVerification } from '../hooks/useEmailVerification';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import Spinner from '../components/Spinner';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, loading, error, success } = useEmailVerification();
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (token && !verificationAttempted) {
      setVerificationAttempted(true);
      verifyEmail(token);
    }
  }, [searchParams, verifyEmail, verificationAttempted]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app p-4">
        <div className="bg-surface border border-white/5 p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <Spinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Verifying Email...</h2>
          <p className="text-gray-400">Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app p-4">
        <div className="bg-surface border border-white/5 p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
          <p className="text-gray-400 mb-6">
            Your email has been successfully verified. You can now log in to your account.
          </p>
          <button
            onClick={handleGoToLogin}
            className="btn-primary w-full py-3"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app p-4">
        <div className="bg-surface border border-white/5 p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleGoToLogin}
              className="btn-primary w-full py-3"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-app p-4">
      <div className="bg-surface border border-white/5 p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
        <Mail className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
        <p className="text-gray-400 mb-6">
          No verification token found. Please check your email for the verification link.
        </p>
        <button
          onClick={handleGoToLogin}
          className="btn-primary w-full py-3"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};
