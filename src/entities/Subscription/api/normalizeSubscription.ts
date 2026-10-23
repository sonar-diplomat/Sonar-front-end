import type { SubscriptionFeatureDTO, SubscriptionPackDTO } from '../model/types';

/** Current server uses `features`; legacy clients use `subscriptionFeatures`. */
export function normalizeSubscriptionPack(value: unknown): SubscriptionPackDTO {
  if (!value || typeof value !== 'object') throw new Error('Invalid subscription pack DTO');
  const pack = value as Record<string, unknown>;
  if (typeof pack.id !== 'number' || typeof pack.name !== 'string' || typeof pack.price !== 'number') throw new Error('Invalid subscription pack metadata');
  const rawFeatures = pack.subscriptionFeatures ?? pack.features;
  const features: SubscriptionFeatureDTO[] = Array.isArray(rawFeatures) ? rawFeatures.map(value => {
    if (!value || typeof value !== 'object' || typeof value.id !== 'number' || typeof value.name !== 'string' || typeof value.price !== 'number') throw new Error('Invalid subscription feature DTO');
    return { id: value.id, name: value.name, price: value.price, description: typeof value.description === 'string' ? value.description : '' };
  }) : [];
  return { id: pack.id, name: pack.name, price: pack.price, description: typeof pack.description === 'string' ? pack.description : '', discountMultiplier: typeof pack.discountMultiplier === 'number' ? pack.discountMultiplier : 1, features, subscriptionFeatures: features };
}
