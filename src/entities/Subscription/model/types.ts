export interface SubscriptionFeatureDTO {
    id: number;
    name: string;
    description: string;
    price: number;
    // TODO: createdAt/updatedAt if present
}

export interface SubscriptionPackDTO {
    id: number;
    name: string;
    discountMultiplier: number;
    description: string;
    price: number;
    subscriptionFeatures: SubscriptionFeatureDTO[];
    // TODO: createdAt/updatedAt if present
}

export interface SubscriptionPaymentDTO {
    id: number;
    amount: number;
    buyerId: number;
    subscriptionPackId: number;
    buyer?: {
        id: number;
        // TODO: extend if User DTO is exposed
    } | null;
    subscriptionPack?: SubscriptionPackDTO | null;
    // TODO: createdAt/updatedAt/paidAt if present
}

export interface PurchaseSubscriptionDTO {
    subscriptionPackId: number;
    amount: number;
}
