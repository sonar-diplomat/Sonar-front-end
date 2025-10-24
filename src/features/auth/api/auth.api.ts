import { apiClient } from '@shared/api/client.ts';
import { API_ENDPOINTS } from '@shared/config';
import type { BaseResponse } from '@shared/types';
import type { UserRegisterDTO } from '@entities/User';

/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */
export const authApi = {
  /**
   * Register a new user
   * @param userData - User registration data
   * @returns Promise with registration result message
   */
  async register(userData: UserRegisterDTO): Promise<BaseResponse<string>> {
    return apiClient.post<string>(API_ENDPOINTS.auth.register, userData);
  },

  /**
   * Login user
   * @param userIdentifier - Username or email
   * @param password - User password
   * @returns Promise with access token, refresh token, and session ID
   */
  async login(
    userIdentifier: string,
    password: string
  ): Promise<BaseResponse<[string, string, number]>> {
    return apiClient.post<[string, string, number]>(
      API_ENDPOINTS.auth.login,
      null,
      {
        params: { userIdentifier, password },
      }
    );
  },

  /**
   * Verify 2FA code
   * @param email - User email
   * @param code - 2FA verification code
   * @returns Promise with access token and refresh token
   */
  async verify2FA(email: string, code: string): Promise<BaseResponse<{ accessToken: string; refreshToken: string }>> {
    return apiClient.post<{ accessToken: string; refreshToken: string }>(
      API_ENDPOINTS.auth.verify2FA,
      { email, code }
    );
  },

  /**
   * Refresh access token using refresh token
   * @param refreshToken - The refresh token
   * @returns Promise with new access token and refresh token
   */
  async refreshToken(refreshToken: string): Promise<BaseResponse<[string, string]>> {
    return apiClient.post<[string, string]>(
      API_ENDPOINTS.auth.refreshToken,
      refreshToken
    );
  },

  /**
   * Change user password
   * @param oldPassword - Current password
   * @param newPassword - New password
   * @param token - 2FA token (if 2FA is enabled)
   * @returns Promise with success message
   */
  async changePassword(
    oldPassword: string,
    newPassword: string,
    token?: string
  ): Promise<BaseResponse<string>> {
    return apiClient.post<string>(
      API_ENDPOINTS.auth.changePassword,
      { oldPassword, newPassword, token }
    );
  },

  /**
   * Request password change (sends email with reset link)
   * @returns Promise with success message
   */
  async requestPasswordChange(): Promise<BaseResponse<string>> {
    return apiClient.post<string>(API_ENDPOINTS.auth.requestPasswordChange);
  },

  /**
   * Confirm email change
   * @param userId - User ID
   * @param email - New email
   * @param token - Confirmation token
   * @returns Promise with success message
   */
  async confirmEmailChange(
    userId: string,
    email: string,
    token: string
  ): Promise<BaseResponse<string>> {
    return apiClient.post<string>(
      API_ENDPOINTS.auth.confirmEmailChange,
      null,
      {
        params: { userId, email, token },
      }
    );
  },

  /**
   * Get all active sessions for the current user
   * @returns Promise with array of active sessions
   */
  async getSessions(): Promise<BaseResponse<unknown[]>> {
    return apiClient.get<unknown[]>(API_ENDPOINTS.auth.getSessions);
  },

  /**
   * Revoke a specific session
   * @param sessionId - Session ID to revoke
   * @returns Promise with success message
   */
  async revokeSession(sessionId: number): Promise<BaseResponse<string>> {
    return apiClient.post<string>(API_ENDPOINTS.auth.revokeSession(sessionId));
  },

  /**
   * Revoke all user sessions
   * @returns Promise with success message
   */
  async revokeAllSessions(): Promise<BaseResponse<string>> {
    return apiClient.post<string>(API_ENDPOINTS.auth.revokeAllSessions);
  },
};