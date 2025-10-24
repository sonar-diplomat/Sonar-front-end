export interface ActiveUserSessionDTO {
    id: number;
    deviceName: string;
    userAgent: string;
    ipAddress: string;
    createdAt: Date;
    lastActive: Date;
}