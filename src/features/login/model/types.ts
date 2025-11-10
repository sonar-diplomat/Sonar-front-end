export interface LoginFormData {
    emailOrUsername: string;
    password: string;
}

export interface LoginFormProps {
    onSubmit?: (data: LoginFormData) => void;
    onForgotPassword?: () => void;
    onContinueWithGoogle?: () => void;
    onContinueWithApple?: () => void;
    onCreateAccount?: () => void;
}