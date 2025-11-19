import type {ReactNode} from "react";

export interface ItemCardContainerProps {
    className?: string;
    children: ReactNode;
    avatar?: string;
    countLabel: string;
    count: number;
    title: string;
}
