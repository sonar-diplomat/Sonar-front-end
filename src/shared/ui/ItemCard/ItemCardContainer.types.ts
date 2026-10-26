import type { ReactNode } from "react";

export interface ItemCardContainerProps {
    className?: string;
    insetCards?: boolean;
    children: ReactNode;
    avatar?: string;
    countLabel: string;
    count: number;
    title: string;
}
