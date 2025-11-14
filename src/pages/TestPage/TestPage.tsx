import React, {useState} from "react";
import { GetPremiumCard } from "@widgets/GetPremium/ui/GetPremiumCard.tsx"
import {CreatorLinksPopup} from "@widgets/CreatorPopups/ui/CreatorLinksPopup.tsx";
import {CreatorActionsPopup} from "@widgets/CreatorPopups/ui/CreatorActionsPopup.tsx";

type PopupType = "links" | "actions" | null;


export const TestPage: React.FC = () => {
    const [popup, setPopup] = useState<PopupType>(null);


    return (
        <div style={{ padding: '16px', overflowY: 'scroll' }}>
            <GetPremiumCard onClick={() => setPopup(Math.random() > 0.5 ? "links" : "actions")} />

            {popup === "links" && (
                <CreatorLinksPopup onClose={() => setPopup(null)} />
            )}

            {popup === "actions" && (
                <CreatorActionsPopup onClose={() => setPopup(null)} />
            )}
        </div>
    );
}