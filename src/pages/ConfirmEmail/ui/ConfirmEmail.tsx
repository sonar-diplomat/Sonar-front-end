import React, { useEffect, useRef } from 'react';

import { Link, useLocation, useSearchParams } from 'react-router-dom';

import { useConfirmEmailMutation, useConfirmEmailChangeMutation } from '@features/auth/api/rtkApi';
import { isDemoMode } from '@shared/config/data-source';

import styles from './ConfirmEmail.module.css';
export const ConfirmEmail = () => {
    const [params] = useSearchParams();
    const location = useLocation();
    const [confirm, confirmation] = useConfirmEmailMutation();
    const [change, changeConfirmation] = useConfirmEmailChangeMutation();
    const attempted = useRef(false);
    const email = params.get('email'); const token = params.get('token');
    const changing = location.pathname === '/confirm-email-change';
    const result = changing ? changeConfirmation : confirmation;
    useEffect(() => {
        if (attempted.current || !email || !token) return;
        attempted.current = true;
        if (changing) void change({ email, token, userId: params.get('userId') || '' });
        else void confirm({ email, token });
    }, [email, token, changing, change, confirm, params]);
    return <main className={styles.container}>
        <h1>Email confirmation</h1>{isDemoMode && <p>Local demo confirmation. No email is sent.</p>}
        {!email || !token ? <p role="alert">This confirmation link is incomplete.</p> : result.isLoading ? <p role="status">Confirming…</p> : result.isSuccess ? <p role="status">Email confirmed.</p> : result.isError ? <p role="alert">Unable to confirm. The link may be invalid or already used.</p> : null}
        <Link to="/login">Sign in</Link><Link to="/home">Go home</Link>
    </main>;
};
