import React,{ StrictMode } from 'react';

import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import { isDemoMode } from '@shared/config/data-source';
import { store } from '@shared/store';

import { router } from "./app/router/routes.tsx";
import './app/styles/index.css';
import { NotificationProvider } from './shared/store/notificationStore';

async function startApplication(): Promise<void> {
    if (isDemoMode) {
        const { bootstrapDemo } = await import('@demo-runtime');
        await bootstrapDemo();
    }
    createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <NotificationProvider>
                <RouterProvider router={router} />
            </NotificationProvider>
        </Provider>
    </StrictMode>
);
}

void startApplication().catch(error => {
    console.error('Application startup failed', error);
    const root = document.getElementById('root');
    if (root) {
        root.textContent = `Unable to start Sonar: ${error instanceof Error ? error.message : String(error)}. Reload to retry.`;
        root.setAttribute('role', 'alert');
    }
});
