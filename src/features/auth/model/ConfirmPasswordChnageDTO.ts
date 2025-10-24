export interface ConfirmPasswordChangeDTO {
    token: string;
    newPassword: string;
    oldPassword: string;
}
