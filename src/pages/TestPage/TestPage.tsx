import React, { useState } from "react";
import {TabBar} from "@widgets/TabBar";
import {PlayerTestComponent} from "@pages/TestPage/PlayerTestComponent.tsx";
import { ShareComponent } from "@widgets/ShareComponent";
import { Button } from "@shared/ui";

export const TestPage: React.FC = () => {
    const [shareOpen, setShareOpen] = useState(false);

    return (
        <div style={{ padding: '16px', overflowY: 'scroll' }}>
            <PlayerTestComponent />

            <div style={{ marginTop: '32px', marginBottom: '32px' }}>
                <Button onClick={() => setShareOpen(true)}>
                    Share
                </Button>
            </div>

            <ShareComponent
                entityType={'Track'}
                entityId={212}
                isOpen={shareOpen}
                onClose={() => setShareOpen(false)}
            />

            <TabBar />
        </div>
    );
}