export interface ProfileCardStats {
    publicPlaylists: number;
    followers: number;
    following: number;
}

export interface ProfileCardProps {
    className?: string;
    src: string;
    alt?: string;
    name?: string;
    isVerified?: boolean;
    stats?: ProfileCardStats;
}