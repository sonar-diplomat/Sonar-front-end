import React from 'react';

import { Link } from 'react-router-dom';

import { useGetSubscriptionPacksQuery,useGetSubscriptionPaymentsQuery,usePurchaseSubscriptionMutation } from '@entities/Subscription/api/rtkApi';
import { isDemoMode } from '@shared/config/data-source';
import { useNotifications } from '@shared/store/notificationStore';
import { Button } from '@shared/ui';
export const Premium = () => {
    const { data: packs, isLoading, error, refetch } = useGetSubscriptionPacksQuery();
    const { data: payments } = useGetSubscriptionPaymentsQuery();
    const [purchase, { isLoading: purchasing }] = usePurchaseSubscriptionMutation();
    const { showError } = useNotifications();
    const buy = async (id: number, price: number) => { try { await purchase({ subscriptionPackId: id, amount: price }).unwrap(); } catch { showError('Unable to activate this plan'); } };
    return <main style={{ padding: 24, maxWidth: 800, margin: 'auto', display: 'grid', gap: 20 }}>
        <Link to="/home">Home</Link><h1>Sonar Premium</h1>
        {isDemoMode && <p>Demo subscription: changes stay in this browser. No payment is taken.</p>}
        {isLoading && <p role="status">Loading plans…</p>}
        {error && <><p role="alert">Unable to load plans.</p><Button onClick={() => void refetch()}>Retry</Button></>}
        {packs?.map(pack => <section key={pack.id} style={{ padding: 20, border: '1px solid #666', borderRadius: 20 }}>
            <h2>{pack.name}</h2><p>{pack.description}</p><p>{isDemoMode ? 'Demo price' : 'Price'}: {pack.price}</p>
            <Button disabled={purchasing || !isDemoMode} onClick={() => void buy(pack.id, pack.price)}>{isDemoMode ? 'Activate demo plan' : 'Checkout unavailable'}</Button>
        </section>)}
        {packs?.length === 0 && <p>No plans available.</p>}
        <section><h2>{isDemoMode ? 'Local activations' : 'Payment history'}</h2>
            {payments?.length ? payments.map(payment => <p key={payment.id}>#{payment.id} · {payment.subscriptionPack?.name || `Plan ${payment.subscriptionPackId}`} · {payment.amount}</p>) : <p>No activations yet.</p>}
        </section>
    </main>;
};
