import { apiClient } from '../utils/languageApi';

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ValidateResetTokenRequest {
  token: string;
}

export interface EmailVerificationResponse {
  message: string;
  user?: {
    id: number;
    username: string;
    email: string;
    email_verified: boolean;
  };
}

export interface PasswordResetResponse {
  message: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  username?: string;
  email?: string;
  error?: string;
}

class EmailService {
  /**
   * Verify user's email with token from verification email
   */
  async verifyEmail(token: string): Promise<EmailVerificationResponse> {
    const response = await apiClient.post<EmailVerificationResponse>('/api/verify-email', {
      token,
    });
    return response.data;
  }

  /**
   * Resend verification email to user
   */
  async resendVerification(email: string): Promise<EmailVerificationResponse> {
    const response = await apiClient.post<EmailVerificationResponse>('/api/resend-verification', {
      email,
    });
    return response.data;
  }

  /**
   * Request password reset - sends email with reset link
   */
  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    const response = await apiClient.post<PasswordResetResponse>('/api/request-password-reset', {
      email,
    });
    return response.data;
  }

  /**
   * Reset password using token from email
   */
  async resetPassword(token: string, newPassword: string): Promise<PasswordResetResponse> {
    const response = await apiClient.post<PasswordResetResponse>('/api/reset-password', {
      token,
      new_password: newPassword,
    });
    return response.data;
  }

  /**
   * Validate if password reset token is still valid
   */
  async validateResetToken(token: string): Promise<ValidateTokenResponse> {
    const response = await apiClient.post<ValidateTokenResponse>('/api/validate-reset-token', {
      token,
    });
    return response.data;
  }
}

// Export singleton instance
export const emailService = new EmailService();
