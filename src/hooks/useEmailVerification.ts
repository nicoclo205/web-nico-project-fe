import { useState } from 'react';
import { emailService } from '../services/apiEmail';

export interface UseEmailVerificationReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  validateResetToken: (token: string) => Promise<{ valid: boolean; username?: string; email?: string }>;
  clearMessages: () => void;
}

export const useEmailVerification = (): UseEmailVerificationReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const clearMessages = () => {
    setError(null);
    setSuccess(false);
  };

  const verifyEmail = async (token: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await emailService.verifyEmail(token);
      setSuccess(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to verify email. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await emailService.resendVerification(email);
      setSuccess(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to resend verification email. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await emailService.requestPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to request password reset. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await emailService.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateResetToken = async (token: string): Promise<{ valid: boolean; username?: string; email?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await emailService.validateResetToken(token);
      if (!response.valid && response.error) {
        setError(response.error);
      }
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to validate token.';
      setError(errorMessage);
      return { valid: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    verifyEmail,
    resendVerification,
    requestPasswordReset,
    resetPassword,
    validateResetToken,
    clearMessages,
  };
};
