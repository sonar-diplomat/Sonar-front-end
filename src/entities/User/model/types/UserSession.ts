import type { User } from './User';

export interface UserSession {
 id: number;
 ipAddress: string; // Stored as string representation (IPv4 or IPv6)
 userAgent: string; // max length: 30
 deviceName: string; // max length: 30
 lastActive: Date;
 userId: number;
 user?: User;
}