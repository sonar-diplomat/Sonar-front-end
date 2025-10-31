export interface PasswordFormData {
    password: string;
    confirmPassword: string;
}

export interface FormErrors {
    password?: string;
    confirmPassword?: string;
}
export interface RegistrationFormData {
    email: string;
    username: string;
    login: string;
    dateOfBirth: string;
}