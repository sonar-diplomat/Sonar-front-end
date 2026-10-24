/** Mode aliases keep mock implementations and seed out of API compilation. */
export async function bootstrapDemo(): Promise<void> {}
export async function resetDemoState(): Promise<void> {}
export async function enterDemoSession(): Promise<void> {}
export async function leaveDemoSession(): Promise<void> {}
export async function getUploadedMediaUrl(): Promise<null> { return null; }
export function getCachedUploadedMediaUrl(): undefined { return undefined; }
export function getDemoOutbox(): never[] { return []; }
export function getDemoStatus() { return { available: false, binaryWarning: null }; }
export function subscribeDemoEvents(): () => void { return () => {}; }
export async function dispatchMock(): Promise<never> {
    throw new Error('Mock transport is unavailable in the API profile');
}
export async function downloadDemo(): Promise<never> {
    throw new Error('Mock downloads are unavailable in the API profile');
}
export default {};
