export interface ProfileCardStats {
    publicPlaylists: number;
    followers: number;
    following: number;
}

export type ProfileCardVariant = 'stats' | 'bio' | 'simple';

export interface ProfileCardProps {
    className?: string;
    src: string;
    alt?: string;
    variant?: ProfileCardVariant;
    // For 'stats' variant
    name?: string;
    isVerified?: boolean;
    stats?: ProfileCardStats;
    // For 'bio' variant
    title?: string;
    bio?: string;
}