import React, { useState } from "react";
import {TabBar} from "@widgets/TabBar";
import {PlayerTestComponent} from "@pages/TestPage/PlayerTestComponent.tsx";
import { ShareComponent } from "@widgets/ShareComponent";
import { Button } from "@shared/ui";

export const TestPage: React.FC = () => {
    const [shareOpen, setShareOpen] = useState(false);
    const [shareConfig, setShareConfig] = useState<{ type: 'Track' | 'Album' | 'Playlist' | 'Artist' | 'User' | 'Blend'; id: number }>({ type: 'Track', id: 1 });

    return (
        <div style={{ padding: '16px', overflowY: 'scroll' }}>
            <PlayerTestComponent />

            <div style={{ marginTop: '32px', marginBottom: '32px' }}>
                <h3 style={{ color: 'white', marginBottom: '16px' }}>Share Component Test</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Button onClick={() => { setShareConfig({ type: 'Track', id: 1 }); setShareOpen(true); }}>
                        Share Track
                    </Button>
                    <Button onClick={() => { setShareConfig({ type: 'Album', id: 1 }); setShareOpen(true); }}>
                        Share Album
                    </Button>
                    <Button onClick={() => { setShareConfig({ type: 'Playlist', id: 1 }); setShareOpen(true); }}>
                        Share Playlist
                    </Button>
                    <Button onClick={() => { setShareConfig({ type: 'Artist', id: 1 }); setShareOpen(true); }}>
                        Share Artist
                    </Button>
                    <Button onClick={() => { setShareConfig({ type: 'User', id: 1 }); setShareOpen(true); }}>
                        Share User
                    </Button>
                </div>
            </div>

            <ShareComponent
                entityType={shareConfig.type}
                entityId={shareConfig.id}
                isOpen={shareOpen}
                onClose={() => setShareOpen(false)}
            />

            <TabBar />
        </div>
    );
}