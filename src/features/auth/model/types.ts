export interface UserRegisterDTO {
    Username: string;
    Login: string;
    Email: string;
    Password: string;
    FirstName: string;
    LastName: string;
    DateOfBirth: string;
    Locale: string;
}

export interface LoginResponseDTO {
    accessToken: string;
    refreshToken: string;
    sessionId: number;
}

export interface Verify2FaDTO {
    Email: string;
    Code: string;
}

export interface RefreshTokenResponse {
    newAccessToken: string;
    refreshToken: string;
}

export interface ConfirmEmailChangeDTO {
    userId: string;
    email: string;
    token: string;
}

export interface ConfirmPasswordChangeDTO {
    Token: string;
    NewPassword: string;
    OldPassword: string;
}

export interface ActiveSessionDTO {
    id: number;
    userAgent?: string;
    deviceName?: string;
    ipAddress?: string;
    createdAt: string;
    lastActive: string;
}

export interface Verify2FaResponseDTO {
    newAccessToken: string;
    refreshToken: string;
}