export interface PasswordRecoveryFormData {
    email: string;
}

export interface PasswordRecoveryProps {
    onSubmit?: (data: PasswordRecoveryFormData) => void;
    isSubmitting?: boolean;
}

export interface AssignNewPasswordFormData {
    password: string;
    repeatPassword: string;
}

export interface AssignNewPasswordProps {
    onSubmit?: (data: AssignNewPasswordFormData) => void;
    isSubmitting?: boolean;
}
