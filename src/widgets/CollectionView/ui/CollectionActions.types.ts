export interface CollectionActionsProps {
    onEditClick?: () => void;
    onSortClick?: () => void;
    sortBy?: 'none' | 'title' | 'artist';
    className?: string;
}