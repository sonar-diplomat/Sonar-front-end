/** Mode aliases keep mock implementations and seed out of API compilation. */
export async function bootstrapDemo(): Promise<void> {}
export async function resetDemoState(): Promise<void> {}
export async function dispatchMock(): Promise<never> {
    throw new Error('Mock transport is unavailable in the API profile');
}
export default {};
