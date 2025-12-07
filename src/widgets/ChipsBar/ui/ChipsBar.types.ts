export type Category = 'All' | 'Tracks' | 'Albums' | 'Playlists' | 'Artists' | 'Users';

export interface ChipsBarProps {
    selectedCategory?: Category;
    onCategoryChange?: (category: Category) => void;
    categories?: Category[];
    className?: string;
}