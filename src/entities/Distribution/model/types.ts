/**
 * Distribution DTOs based on Documentation/All_DTOs.txt
 */

export interface DistributorDTO {
    id: number;
    name: string;
    createdAt: string; // ISO date string
    description: string;
    contactEmail: string;
    coverId: number;
    albumCount: number;
    license: LicenseDTO;
}

export interface CreateDistributorDTO {
    name: string;
    description: string;
    contactEmail: string;
    expirationDate: string; // ISO date string
    cover: File;
}

export interface UpdateDistributorDTO {
    name?: string;
    description?: string;
    contactEmail?: string;
}

export interface LicenseDTO {
    id: number;
    issuingDate: string; // ISO date string
    lastUpdatedDate: string; // ISO date string
    expirationDate: string; // ISO date string
    issuerId: number;
}

export interface DistributorAccountDTO {
    id: number;
    userName: string;
    email: string;
    isMaster: boolean;
    distributorId: number;
}

export interface DistributorAccountRegisterDTO {
    email: string;
    password: string;
    userName: string;
    distributorId: number;
}

export interface DistributorAccountChangePasswordDTO {
    oldPassword: string;
    newPassword: string;
}

export interface ArtistRegistrationRequestDTO {
    id: number;
    userId: number;
    artistName: string;
    distributorId: number;
    requestedAt: string; // ISO date string
    resolvedAt?: string; // ISO date string
    isResolved: boolean;
}

