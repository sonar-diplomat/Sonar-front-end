export type Category = 'All' | 'Creators' | 'Playlists' | 'Radio';

export interface ChipsBarProps {
    selectedCategory?: Category;
    onCategoryChange?: (category: Category) => void;
    categories?: Category[];
    className?: string;
}