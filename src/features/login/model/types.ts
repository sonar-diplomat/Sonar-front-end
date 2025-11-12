export interface LoginFormData {
    emailOrLogin: string;
    password: string;
}

export interface LoginFormProps {
    onSubmit?: (data: LoginFormData) => void;
    onForgotPassword?: () => void;
    onContinueWithGoogle?: () => void;
    onContinueWithApple?: () => void;
    onCreateAccount?: () => void;
}

export interface TwoFactorVerificationProps {
    email: string;
    onVerify: (code: string) => void;
    onResend?: () => void;
}