export interface UserRegisterDTO {
    userName: string;
    login: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    locale: string;
}

export interface LoginResponseDTO {
    accessToken: string;
    refreshToken: string;
    sessionId: number;
}

export interface Verify2FaDTO {
    email: string;
    code: string;
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
    token: string;
    newPassword: string;
    oldPassword: string;
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