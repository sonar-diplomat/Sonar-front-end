export interface Artist {
    id: string;
    name: string;
    imageSrc: string;
    imageAlt?: string;
}

export interface TopArtistsWidgetProps {
    artists: Artist[];
    dateRange?: string;
    isLoading?: boolean;
    error?: boolean;
    onRetry?: () => void;
    className?: string;
}
