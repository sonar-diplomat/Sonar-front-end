/**
 * User Registration Data Transfer Object
 * Matches the backend UserRegisterDTO structure
 */
export interface UserRegisterDTO {
  /**
   * User's display username
   */
  username: string;

  /**
   * User's login identifier
   */
  login: string;

  /**
   * User's email address
   */
  email: string;

  /**
   * User's password (plain text - will be hashed by backend)
   */
  password: string;

  /**
   * User's first name
   */
  firstName: string;

  /**
   * User's last name
   */
  lastName: string;

  /**
   * User's date of birth in ISO format (YYYY-MM-DD)
   * Maps to C# DateOnly type
   */
  dateOfBirth: string;

  /**
   * User's locale/language preference (e.g., "en-US", "uk-UA")
   */
  locale: string;
}