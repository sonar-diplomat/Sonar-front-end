export interface LoginFormData {
    emailOrLogin: string;
    password: string;
}

export interface LoginFormProps {
    onSubmit?: (data: LoginFormData) => void;
    onForgotPassword: () => void;
    onContinueWithGoogle?: () => void;
    onContinueWithApple?: () => void;
    onCreateAccount?: () => void;
    isSubmitting?: boolean;
    error?: string;
}

export interface TwoFactorVerificationProps {
    email: string;
    onVerify: (code: string) => void;
    onResend?: () => void;
    isSubmitting?: boolean;
    error?: string;
}