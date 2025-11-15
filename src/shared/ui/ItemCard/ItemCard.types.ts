export type ItemCardSize = 'small' | 'medium' | 'large';

export interface ItemCardProps {
    className?: string;
    onClick?: () => void;
    textContent?: ItemCardTextContent;
    backgroundColor?: string;
    image?: string;
    size?: ItemCardSize;
}

export interface ItemCardTextContent {
    subtitle2?: string;
    subtitle1?: string;
    title: string;
}
