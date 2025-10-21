/**
 * Generic response wrapper matching the backend BaseResponse<T> structure
 * Used for all API responses from the .NET backend
 */
export interface BaseResponse<T> {
  /**
   * The response data payload
   */
  data: T;

  /**
   * Message from the server (success or error message)
   */
  message: string;

  /**
   * Indicates whether the operation was successful
   */
  success: boolean;
}