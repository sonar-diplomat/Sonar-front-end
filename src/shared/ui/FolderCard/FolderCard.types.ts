export interface DraggedItem {
    type: 'collection' | 'folder';
    id: number;
    name: string;
}

export interface DropInfo {
    draggedItem: DraggedItem;
    targetFolderId: number;
    moveToParent: boolean;
}

export interface FolderCardProps {
    className?: string;
    onClick?: () => void;
    label: string;
    size?: 'small' | 'medium';
    folderId?: number;
    onDrop?: (dropInfo: DropInfo) => void;
}
