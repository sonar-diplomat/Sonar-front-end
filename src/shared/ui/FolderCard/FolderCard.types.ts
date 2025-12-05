export interface DraggedItem {
    type: 'collection' | 'folder';
    id: number;
    name: string;
}

export interface FolderCardProps {
    className?: string;
    onClick?: () => void;
    label: string;
    size?: 'small' | 'medium';
    folderId?: number;
    onDrop?: (draggedItem: DraggedItem) => void;
}
